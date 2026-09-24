const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const NotificationPreference = sequelize.define(
    "NotificationPreference",
    {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      expenses: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      settlements: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      members: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      reactions: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "notification_preferences",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return NotificationPreference;
};