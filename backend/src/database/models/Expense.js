const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Expense = sequelize.define(
    "Expense",
    {
      expense_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      paid_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "expenses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Expense;
};
