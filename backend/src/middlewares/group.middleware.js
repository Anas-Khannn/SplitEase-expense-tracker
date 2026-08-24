const { Group, GroupMember } = require("../database/models");
const { NotFoundError, ForbiddenError, BadRequestError } = require("../errors");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ensureValidGroupId = (groupId) => {
  if (!UUID_REGEX.test(groupId)) {
    throw new BadRequestError("Please provide a valid group ID");
  }
};

const authorizeGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.user_id;

    ensureValidGroupId(groupId);

    const group = await Group.findByPk(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId },
    });

    if (!membership) {
      throw new ForbiddenError("You are not a member of this group");
    }

    req.groupMembership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.user_id;

    ensureValidGroupId(groupId);

    const group = await Group.findByPk(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId },
    });

    if (!membership) {
      throw new ForbiddenError("You are not a member of this group");
    }

    if (membership.role !== "admin") {
      throw new ForbiddenError("Only group admins can perform this action");
    }

    req.groupMembership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authorizeGroupMember, authorizeGroupAdmin };
