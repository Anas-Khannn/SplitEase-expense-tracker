"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      payment_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      group_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "groups",
          key: "group_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      paid_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      paid_to: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      payment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      note: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payments");
  },
};
