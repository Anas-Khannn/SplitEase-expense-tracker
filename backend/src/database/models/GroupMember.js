const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GroupMember = sequelize.define(
    "GroupMember",
    {
      group_member_id: {
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
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "group_members",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["group_id", "user_id"],
        },
      ],
    }
  );

  return GroupMember;
};
