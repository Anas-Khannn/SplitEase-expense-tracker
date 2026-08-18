const groupService = require("./group.service");

const createGroup = async (req, res) => {
  try {
    const result = await groupService.createGroup(req.user.user_id, req.body);

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: { group: result },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const groups = await groupService.getMyGroups(req.user.user_id);

    return res.status(200).json({
      success: true,
      data: { groups },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(
      req.params.groupId,
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      data: { group },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const members = await groupService.getGroupMembers(
      req.params.groupId,
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      data: { members },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const addMember = async (req, res) => {
  try {
    const result = await groupService.addMember(
      req.params.groupId,
      req.user.user_id,
      req.body.user_id
    );

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: { member: result },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const result = await groupService.removeMember(
      req.params.groupId,
      req.user.user_id,
      req.params.userId
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const result = await groupService.updateMemberRole(
      req.params.groupId,
      req.user.user_id,
      req.params.userId,
      req.body.role
    );

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: { member: result },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
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
