const groupService = require("../services/group.service");
const HTTP_STATUSES = require("../constants/http-statuses");

const createGroup = async (req, res, next) => {
  try {
    const result = await groupService.createGroup(req.user.user_id, req.body);

    return res.status(HTTP_STATUSES.CREATED).json({
      success: true,
      message: "Group created successfully",
      data: { group: result },
    });
  } catch (error) {
    next(error);
  }
};

const getMyGroups = async (req, res, next) => {
  try {
    const groups = await groupService.getMyGroups(req.user.user_id);

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { groups },
    });
  } catch (error) {
    next(error);
  }
};

const getGroupById = async (req, res, next) => {
  try {
    const group = await groupService.getGroupById(req.params.groupId);

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { group },
    });
  } catch (error) {
    next(error);
  }
};

const getGroupMembers = async (req, res, next) => {
  try {
    const members = await groupService.getGroupMembers(req.params.groupId);

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: { members },
    });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const result = await groupService.addMember(
      req.params.groupId,
      req.body.user_id
    );

    return res.status(HTTP_STATUSES.CREATED).json({
      success: true,
      message: "Member added successfully",
      data: { member: result },
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const result = await groupService.removeMember(
      req.params.groupId,
      req.params.userId
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const result = await groupService.updateMemberRole(
      req.params.groupId,
      req.params.userId,
      req.body.role
    );

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      message: "Member role updated successfully",
      data: { member: result },
    });
  } catch (error) {
    next(error);
  }
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
