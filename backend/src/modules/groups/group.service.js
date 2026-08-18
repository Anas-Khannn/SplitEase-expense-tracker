const { Group, GroupMember, User } = require("../../database/models");
const { sequelize } = require("../../database/models");

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

const getGroupById = async (groupId, userId) => {
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
    attributes: ["group_id", "name", "icon", "description", "created_by", "created_at", "updated_at"],
  });

  if (!group) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  const isMember = group.members.some((m) => m.user.user_id === userId);
  if (!isMember) {
    const error = new Error("You are not a member of this group");
    error.statusCode = 403;
    throw error;
  }

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

const getGroupMembers = async (groupId, userId) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  const requesterMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: userId },
  });

  if (!requesterMembership) {
    const error = new Error("You are not a member of this group");
    error.statusCode = 403;
    throw error;
  }

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

const addMember = async (groupId, requesterId, targetUserId) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  const requesterMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: requesterId },
  });

  if (!requesterMembership || requesterMembership.role !== "admin") {
    const error = new Error("Only group admins can add members");
    error.statusCode = 403;
    throw error;
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const existingMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: targetUserId },
  });

  if (existingMembership) {
    const error = new Error("User is already a member of this group");
    error.statusCode = 409;
    throw error;
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

const removeMember = async (groupId, requesterId, targetUserId) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  const requesterMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: requesterId },
  });

  if (!requesterMembership || requesterMembership.role !== "admin") {
    const error = new Error("Only group admins can remove members");
    error.statusCode = 403;
    throw error;
  }

  if (requesterId === targetUserId) {
    const error = new Error("Admins cannot remove themselves from the group");
    error.statusCode = 400;
    throw error;
  }

  const targetMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: targetUserId },
  });

  if (!targetMembership) {
    const error = new Error("User is not a member of this group");
    error.statusCode = 404;
    throw error;
  }

  if (targetMembership.role === "admin") {
    const adminCount = await GroupMember.count({
      where: { group_id: groupId, role: "admin" },
    });

    if (adminCount <= 1) {
      const error = new Error("Cannot remove the last admin from the group");
      error.statusCode = 400;
      throw error;
    }
  }

  await targetMembership.destroy();

  return { message: "Member removed successfully" };
};

const updateMemberRole = async (groupId, requesterId, targetUserId, newRole) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  const requesterMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: requesterId },
  });

  if (!requesterMembership || requesterMembership.role !== "admin") {
    const error = new Error("Only group admins can change member roles");
    error.statusCode = 403;
    throw error;
  }

  if (requesterId === targetUserId) {
    const error = new Error("Admins cannot change their own role");
    error.statusCode = 400;
    throw error;
  }

  const targetMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: targetUserId },
  });

  if (!targetMembership) {
    const error = new Error("User is not a member of this group");
    error.statusCode = 404;
    throw error;
  }

  if (targetMembership.role === newRole) {
    const error = new Error(`User already has the role '${newRole}'`);
    error.statusCode = 400;
    throw error;
  }

  if (targetMembership.role === "admin" && newRole === "member") {
    const adminCount = await GroupMember.count({
      where: { group_id: groupId, role: "admin" },
    });

    if (adminCount <= 1) {
      const error = new Error("Cannot demote the last admin of the group");
      error.statusCode = 400;
      throw error;
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
