const { Group, GroupMember } = require("../database/models");
const { NotFoundError, ForbiddenError } = require("../errors");

const authorizeGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.user_id;

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
