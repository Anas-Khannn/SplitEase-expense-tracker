const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const authenticate = require("../middlewares/auth.middleware");
const { authorizeGroupMember, authorizeGroupAdmin } = require("../middlewares/group.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createGroupSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  userIdParamsSchema,
} = require("../validators/group.validation");

router.post("/", authenticate, validate(createGroupSchema), groupController.createGroup);

router.get("/", authenticate, groupController.getMyGroups);

router.get("/:groupId", authenticate, authorizeGroupMember, groupController.getGroupById);

router.get(
  "/:groupId/members",
  authenticate,
  authorizeGroupMember,
  groupController.getGroupMembers,
);

router.post(
  "/:groupId/members",
  authenticate,
  authorizeGroupAdmin,
  validate(addMemberSchema),
  groupController.addMember,
);

router.delete(
  "/:groupId/members/:userId",
  authenticate,
  authorizeGroupAdmin,
  validate(userIdParamsSchema, "params"),
  groupController.removeMember,
);

router.patch(
  "/:groupId/members/:userId/role",
  authenticate,
  authorizeGroupAdmin,
  validate(userIdParamsSchema, "params"),
  validate(updateMemberRoleSchema),
  groupController.updateMemberRole,
);

module.exports = router;
