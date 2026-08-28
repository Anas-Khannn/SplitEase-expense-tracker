import { apiClient } from "../lib/api/client";
import type {
  ApiResponse,
  Group,
  GroupListItem,
  GroupDetail,
  GroupMemberRecord,
  CreateGroupRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
} from "@/types";

export const groupsApi = {
  list() {
    return apiClient.get<ApiResponse<{ groups: GroupListItem[] }>>("/groups");
  },

  create(data: CreateGroupRequest) {
    return apiClient.post<ApiResponse<{ group: Group }>>("/groups", data);
  },

  get(groupId: string) {
    return apiClient.get<ApiResponse<{ group: GroupDetail }>>(
      `/groups/${groupId}`
    );
  },

  getMembers(groupId: string) {
    return apiClient.get<ApiResponse<{ members: GroupMemberRecord[] }>>(
      `/groups/${groupId}/members`
    );
  },

  addMember(groupId: string, data: AddMemberRequest) {
    return apiClient.post<ApiResponse<{ member: GroupMemberRecord }>>(
      `/groups/${groupId}/members`,
      data
    );
  },

  removeMember(groupId: string, userId: string) {
    return apiClient.delete<ApiResponse<null>>(
      `/groups/${groupId}/members/${userId}`
    );
  },

  updateMemberRole(groupId: string, userId: string, data: UpdateMemberRoleRequest) {
    return apiClient.patch<ApiResponse<{ member: GroupMemberRecord }>>(
      `/groups/${groupId}/members/${userId}/role`,
      data
    );
  },
};
