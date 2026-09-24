"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "username", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    const users = await queryInterface.sequelize.query(
      "SELECT user_id, email FROM users",
      { type: Sequelize.QueryTypes.SELECT },
    );

    const seen = new Map();
    for (const user of users) {
      const localPart = String(user.email || "").split("@")[0] || "user";
      const base = localPart
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "")
        .replace(/^[._-]+|[._-]+$/g, "")
        .slice(0, 30);

      let candidate = base || "user";
      let suffix = 1;
      while (seen.has(candidate)) {
        candidate = `${base}_${suffix}`;
        suffix += 1;
      }
      seen.set(candidate, true);

      await queryInterface.sequelize.query(
        "UPDATE users SET username = :username WHERE user_id = :user_id",
        { replacements: { username: candidate, user_id: user.user_id } },
      );
    }

    await queryInterface.addIndex("users", ["username"], {
      name: "users_username_unique",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("users", "users_username_unique");
    await queryInterface.removeColumn("users", "username");
  },
};