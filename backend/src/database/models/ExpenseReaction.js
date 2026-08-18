const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExpenseReaction = sequelize.define(
    "ExpenseReaction",
    {
      reaction_id: {
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
      reaction: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: "expense_reactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["expense_id", "user_id"],
        },
      ],
    }
  );

  return ExpenseReaction;
};
