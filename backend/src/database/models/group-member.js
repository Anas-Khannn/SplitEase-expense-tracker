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
      role: {
        type: DataTypes.ENUM("admin", "member"),
        allowNull: false,
        defaultValue: "member",
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
