const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define(
    "ActivityLog",
    {
      activity_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "activity_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return ActivityLog;
};
