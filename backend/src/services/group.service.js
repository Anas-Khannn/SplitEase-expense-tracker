const { Group, GroupMember, User } = require("../database/models");
const { sequelize } = require("../database/models");
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} = require("../errors");

const createGroup = async (userId, { name, icon, description }) => {
  const result = await sequelize.transaction(async (t) => {
    const group = await Group.create(
      {
        created_by: userId,
        name,
        icon: icon || null,
        description: description || null,
      },
      { transaction: t }
    );

    const membership = await GroupMember.create(
      {
        group_id: group.group_id,
        user_id: userId,
        role: "admin",
      },
      { transaction: t }
    );

    return {
      group_id: group.group_id,
      name: group.name,
      icon: group.icon,
      description: group.description,
      created_by: group.created_by,
      created_at: group.created_at,
      updated_at: group.updated_at,
    };
  });

  return result;
};

const getMyGroups = async (userId) => {
  const memberships = await GroupMember.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Group,
        as: "group",
        attributes: ["group_id", "name", "icon", "description"],
      },
    ],
    attributes: ["role"],
  });

  return memberships.map((m) => ({
    group_id: m.group.group_id,
    name: m.group.name,
    icon: m.group.icon,
    description: m.group.description,
    role: m.role,
  }));
};

const getGroupById = async (groupId) => {
  const group = await Group.findByPk(groupId, {
    include: [
      {
        model: GroupMember,
        as: "members",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "name", "email"],
          },
        ],
        attributes: ["role", "joined_at"],
      },
    ],
    attributes: [
      "group_id",
      "name",
      "icon",
      "description",
      "created_by",
      "created_at",
      "updated_at",
    ],
  });

  return {
    group_id: group.group_id,
    name: group.name,
    icon: group.icon,
    description: group.description,
    created_by: group.created_by,
    created_at: group.created_at,
    updated_at: group.updated_at,
    members: group.members.map((m) => ({
      user_id: m.user.user_id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joined_at: m.joined_at,
    })),
  };
};

const getGroupMembers = async (groupId) => {
  const members = await GroupMember.findAll({
    where: { group_id: groupId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "name", "email"],
      },
    ],
    attributes: ["role", "joined_at"],
  });

  return members.map((m) => ({
    user_id: m.user.user_id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joined_at: m.joined_at,
  }));
};

const addMember = async (groupId, targetUserId) => {
  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  const existingMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: targetUserId },
  });

  if (existingMembership) {
    throw new ConflictError("User is already a member of this group");
  }

  const membership = await GroupMember.create({
    group_id: groupId,
    user_id: targetUserId,
    role: "member",
  });

  return {
    group_member_id: membership.group_member_id,
    group_id: membership.group_id,
    user_id: membership.user_id,
    role: membership.role,
    joined_at: membership.joined_at,
  };
};

const removeMember = async (groupId, targetUserId) => {
  const targetMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: targetUserId },
  });

  if (!targetMembership) {
    throw new NotFoundError("User is not a member of this group");
  }

  if (targetMembership.role === "admin") {
    const adminCount = await GroupMember.count({
      where: { group_id: groupId, role: "admin" },
    });

    if (adminCount <= 1) {
      throw new BadRequestError("Cannot remove the last admin from the group");
    }
  }

  await targetMembership.destroy();

  return { message: "Member removed successfully" };
};

const updateMemberRole = async (groupId, targetUserId, newRole) => {
  const targetMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: targetUserId },
  });

  if (!targetMembership) {
    throw new NotFoundError("User is not a member of this group");
  }

  if (targetMembership.role === newRole) {
    throw new BadRequestError(`User already has the role '${newRole}'`);
  }

  if (targetMembership.role === "admin" && newRole === "member") {
    const adminCount = await GroupMember.count({
      where: { group_id: groupId, role: "admin" },
    });

    if (adminCount <= 1) {
      throw new BadRequestError("Cannot demote the last admin of the group");
    }
  }

  await targetMembership.update({ role: newRole });

  return {
    group_member_id: targetMembership.group_member_id,
    group_id: targetMembership.group_id,
    user_id: targetMembership.user_id,
    role: targetMembership.role,
    joined_at: targetMembership.joined_at,
  };
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  getGroupMembers,
  addMember,
  removeMember,
  updateMemberRole,
};
