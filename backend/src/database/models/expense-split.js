const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExpenseSplit = sequelize.define(
    "ExpenseSplit",
    {
      expense_split_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      expense_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      share_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: "expense_splits",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["expense_id", "user_id"],
        },
      ],
    },
  );

  return ExpenseSplit;
};
