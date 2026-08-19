const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createGroupSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} = require("../validators/group.validation");

router.post(
  "/",
  authenticate,
  validate(createGroupSchema),
  groupController.createGroup
);

router.get("/", authenticate, groupController.getMyGroups);

router.get("/:groupId", authenticate, groupController.getGroupById);

router.get("/:groupId/members", authenticate, groupController.getGroupMembers);

router.post(
  "/:groupId/members",
  authenticate,
  validate(addMemberSchema),
  groupController.addMember
);

router.delete(
  "/:groupId/members/:userId",
  authenticate,
  groupController.removeMember
);

router.patch(
  "/:groupId/members/:userId/role",
  authenticate,
  validate(updateMemberRoleSchema),
  groupController.updateMemberRole
);

module.exports = router;
