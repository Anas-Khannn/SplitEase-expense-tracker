"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expense_reactions", {
      reaction_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      expense_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "expenses",
          key: "expense_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reaction: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    await queryInterface.addConstraint("expense_reactions", {
      fields: ["expense_id", "user_id"],
      type: "unique",
      name: "unique_expense_reaction_user",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "expense_reactions",
      "unique_expense_reaction_user"
    );
    await queryInterface.dropTable("expense_reactions");
  },
};
