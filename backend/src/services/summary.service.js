const { Op, fn, col } = require("sequelize");
const { Expense, User } = require("../database/models");

// Builds [start, end) boundaries for a YYYY-MM month as plain strings.
// expense_date is DATEONLY, so string comparisons avoid timezone shifts
// that JavaScript Date conversions could introduce.
const getMonthRange = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);

  let endYear = year;
  let endMonth = monthNumber + 1;
  if (endMonth > 12) {
    endMonth = 1;
    endYear += 1;
  }

  const pad = (n) => String(n).padStart(2, "0");

  return {
    start: `${year}-${pad(monthNumber)}-01`,
    endExclusive: `${endYear}-${pad(endMonth)}-01`,
  };
};

const buildSummaryWhere = (groupId, month) => {
  const where = { group_id: groupId };

  if (month) {
    const { start, endExclusive } = getMonthRange(month);
    where.expense_date = {
      [Op.gte]: start,
      [Op.lt]: endExclusive,
    };
  }

  return where;
};

const toNumber = (value) => (value === null || value === undefined ? 0 : parseFloat(value));

const getGroupSummary = async (groupId, { month } = {}) => {
  const where = buildSummaryWhere(groupId, month);

  const totalResult = await Expense.findOne({
    attributes: [[fn("SUM", col("amount")), "total_spending"]],
    where,
    raw: true,
  });

  const totalSpending = parseFloat(
    toNumber(totalResult ? totalResult.total_spending : null).toFixed(2),
  );

  // GROUP BY paid_by: how much each user actually paid.
  // The payer LEFT JOIN cannot multiply expense rows (user_id is the
  // users primary key), so SUM(amount) stays mathematically correct.
  const contributionsRaw = await Expense.findAll({
    attributes: ["paid_by", [fn("SUM", col("amount")), "total_paid"]],
    where,
    include: [
      {
        model: User,
        as: "payer",
        attributes: ["user_id", "name"],
      },
    ],
    group: ["paid_by", "payer.user_id", "payer.name"],
    raw: true,
  });

  const contributions = contributionsRaw
    .map((row) => ({
      user_id: row.paid_by,
      name: row["payer.name"],
      amount: parseFloat(toNumber(row.total_paid).toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total_spending: totalSpending,
    contributions,
  };
};

module.exports = { getGroupSummary };
