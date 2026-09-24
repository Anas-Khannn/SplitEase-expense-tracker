"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "email_verification_otp", {
      type: Sequelize.STRING(6),
      allowNull: true,
    });

    await queryInterface.addColumn(
      "users",
      "email_verification_otp_expires_at",
      {
        type: Sequelize.DATE,
        allowNull: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "users",
      "email_verification_otp_expires_at",
    );
    await queryInterface.removeColumn("users", "email_verification_otp");
    await queryInterface.removeColumn("users", "email_verified");
  },
};