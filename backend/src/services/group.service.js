const { Group, GroupMember, User } = require("../database/models");
const { sequelize } = require("../database/models");
const { NotFoundError, ConflictError, BadRequestError } = require("../errors");
const ACTIVITY_TYPES = require("../constants/activity-types");
const { logActivity } = require("./activity.service");
const eventBus = require("../events/event-bus");
const EVENTS = require("../events/events");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const resolveTargetUser = async (identifierOrUserId) => {
  if (!identifierOrUserId) return null;

  const raw = String(identifierOrUserId).trim();

  if (UUID_PATTERN.test(raw)) {
    return User.findByPk(raw);
  }

  const normalized = raw.toLowerCase();

  if (normalized.includes("@")) {
    return User.findOne({ where: { email: normalized } });
  }

  return User.findOne({ where: { username: normalized } });
};

const createGroup = async (userId, { name, icon, description }) => {
  const result = await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });

    const group = await Group.create(
      {
        created_by: userId,
        name,
        icon: icon || null,
        description: description || null,
      },
      { transaction: t },
    );

    await GroupMember.create(
      {
        group_id: group.group_id,
        user_id: userId,
        role: "admin",
      },
      { transaction: t },
    );

    await logActivity(
      group.group_id,
      userId,
      ACTIVITY_TYPES.GROUP_CREATED,
      `${user.name} created the group.`,
      t,
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
            attributes: ["user_id", "name", "email", "username"],
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
      username: m.user.username,
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
        attributes: ["user_id", "name", "email", "username"],
      },
    ],
    attributes: ["role", "joined_at"],
  });

  return members.map((m) => ({
    user_id: m.user.user_id,
    name: m.user.name,
    email: m.user.email,
    username: m.user.username,
    role: m.role,
    joined_at: m.joined_at,
  }));
};

const addMember = async (groupId, identifierOrUserId, actorUserId) => {
  const targetUser = await resolveTargetUser(identifierOrUserId);

  if (!targetUser) {
    throw new NotFoundError("User not found by that email or username");
  }

  const targetUserId = targetUser.user_id;

  const existingMembership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: targetUserId },
  });

  if (existingMembership) {
    throw new ConflictError("User is already a member of this group");
  }

  const result = await sequelize.transaction(async (t) => {
    const membership = await GroupMember.create(
      {
        group_id: groupId,
        user_id: targetUserId,
        role: "member",
      },
      { transaction: t },
    );

    const actor = await User.findByPk(actorUserId, { transaction: t });

    await logActivity(
      groupId,
      actorUserId,
      ACTIVITY_TYPES.MEMBER_ADDED,
      `${actor.name} added ${targetUser.name} to the group.`,
      t,
    );

    return membership;
  });

  const [group, actor] = await Promise.all([
    Group.findByPk(groupId),
    User.findByPk(actorUserId),
  ]);

  eventBus.emit(EVENTS.MEMBER_ADDED, {
    targetUserId,
    groupId,
    groupName: group ? group.name : "the group",
    actorName: actor ? actor.name : "Someone",
  });

  return {
    group_member_id: result.group_member_id,
    group_id: result.group_id,
    user_id: result.user_id,
    role: result.role,
    joined_at: result.joined_at,
  };
};

const removeMember = async (groupId, targetUserId, actorUserId) => {
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

  const targetUser = await User.findByPk(targetUserId);

  await sequelize.transaction(async (t) => {
    await targetMembership.destroy({ transaction: t });

    const actor = await User.findByPk(actorUserId, { transaction: t });

    await logActivity(
      groupId,
      actorUserId,
      ACTIVITY_TYPES.MEMBER_REMOVED,
      `${actor.name} removed ${targetUser.name} from the group.`,
      t,
    );
  });

  const [group, actor] = await Promise.all([
    Group.findByPk(groupId),
    User.findByPk(actorUserId),
  ]);

  eventBus.emit(EVENTS.MEMBER_REMOVED, {
    targetUserId,
    groupId,
    groupName: group ? group.name : "the group",
    actorName: actor ? actor.name : "Someone",
  });

  return { message: "Member removed successfully" };
};

const updateMemberRole = async (groupId, targetUserId, newRole, actorUserId) => {
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

  const [group, actor, targetUser] = await Promise.all([
    Group.findByPk(groupId),
    User.findByPk(actorUserId),
    User.findByPk(targetUserId),
  ]);

  const actorName = actor ? actor.name : "Someone";

  await logActivity(
    groupId,
    actorUserId,
    ACTIVITY_TYPES.MEMBER_ROLE_CHANGED,
    `${actorName} changed ${
      targetUser ? targetUser.name : "a member"
    }'s role to ${newRole}.`,
  );

  eventBus.emit(EVENTS.MEMBER_ROLE_CHANGED, {
    targetUserId,
    groupId,
    groupName: group ? group.name : "the group",
    actorName,
    newRole,
  });

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
