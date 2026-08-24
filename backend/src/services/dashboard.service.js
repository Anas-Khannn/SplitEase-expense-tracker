const { Group, GroupMember } = require("../database/models");
const { calculateUserGroupBalance } = require("./balance.service");

const roundMoney = (value) => parseFloat(value.toFixed(2));

const getUserDashboard = async (userId) => {
  const memberships = await GroupMember.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Group,
        as: "group",
        attributes: ["group_id", "name", "icon"],
      },
    ],
    order: [["created_at", "ASC"]],
  });

  let totalOwed = 0;
  let totalOwe = 0;

  const groups = [];
  for (const membership of memberships) {
    const group = membership.group;
    const balance = await calculateUserGroupBalance(
      userId,
      group.group_id
    );

    if (balance > 0) {
      totalOwed += balance;
    } else if (balance < 0) {
      totalOwe += Math.abs(balance);
    }

    groups.push({
      group_id: group.group_id,
      group_name: group.name,
      icon: group.icon,
      balance,
    });
  }

  // Sorted by absolute balance DESC so the most significant groups render first
  groups.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  return {
    total_owed: roundMoney(totalOwed),
    total_owe: roundMoney(totalOwe),
    net_balance: roundMoney(totalOwed - totalOwe),
    groups,
  };
};

module.exports = { getUserDashboard };
