const groupService = require("../services/group.service");
const HTTP_STATUSES = require("../constants/http-statuses");
const asyncHandler = require("../middlewares/async-handler.middleware");

const createGroup = asyncHandler(async (req, res) => {
  const result = await groupService.createGroup(req.user.user_id, req.body);

  return res.status(HTTP_STATUSES.CREATED).json({
    success: true,
    message: "Group created successfully",
    data: { group: result },
  });
});

const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getMyGroups(req.user.user_id);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { groups },
  });
});

const getGroupById = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.params.groupId);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { group },
  });
});

const getGroupMembers = asyncHandler(async (req, res) => {
  const members = await groupService.getGroupMembers(req.params.groupId);

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: { members },
  });
});

const addMember = asyncHandler(async (req, res) => {
  const result = await groupService.addMember(
    req.params.groupId,
    req.body.user_id,
    req.user.user_id,
  );

  return res.status(HTTP_STATUSES.CREATED).json({
    success: true,
    message: "Member added successfully",
    data: { member: result },
  });
});

const removeMember = asyncHandler(async (req, res) => {
  const result = await groupService.removeMember(
    req.params.groupId,
    req.params.userId,
    req.user.user_id,
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: result.message,
  });
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const result = await groupService.updateMemberRole(
    req.params.groupId,
    req.params.userId,
    req.body.role,
  );

  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: "Member role updated successfully",
    data: { member: result },
  });
});

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  getGroupMembers,
  addMember,
  removeMember,
  updateMemberRole,
};
