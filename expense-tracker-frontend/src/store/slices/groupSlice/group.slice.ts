import { groupApis } from "@/services/group.service";
import { CreateInvite, Group, GroupInvite, GroupMember, GroupStates } from "@/types/group.types";
import { handleApiError } from "@/utils/apiError";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: GroupStates = {
    groups: [],
    createInvite: null,
    groupInvite: [],
    groupMember: [],
    loading: false,
    error: null,
    success: false,
};

// Async Thunks
export const createGroup = createAsyncThunk(
    "groups/create",
    async (data: Partial<Group>, { rejectWithValue }) => {
        try {
            const response = await groupApis.createGroup(data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewGroups = createAsyncThunk(
    "groups/viewAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await groupApis.viewGroups();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewGroup = createAsyncThunk(
    "groups/viewById",
    async (groupId: string, { rejectWithValue }) => {
        try {
            const response = await groupApis.viewGroup(groupId);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const updateGroup = createAsyncThunk(
    "groups/update",
    async ({ groupId, data }: { groupId: string; data: Partial<Group> }, { rejectWithValue }) => {
        try {
            const response = await groupApis.updateGroup(groupId, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const sendInvitation = createAsyncThunk(
    "groups/sendInvitation",
    async ({ groupId, data }: { groupId: string; data: CreateInvite }, { rejectWithValue }) => {
        try {
            const response = await groupApis.sendInvitation(groupId, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const acceptInvitation = createAsyncThunk(
    "groups/acceptInvitation",
    async (token: string, { rejectWithValue }) => {
        try {
            const response = await groupApis.acceptInvitation(token);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const declineInvitation = createAsyncThunk(
    "groups/declineInvitation",
    async (groupId: string, { rejectWithValue }) => {
        try {
            const response = await groupApis.declineInvitation(groupId);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewInvitations = createAsyncThunk(
    "groups/viewInvitations",
    async (_, { rejectWithValue }) => {
        try {
            const response = await groupApis.viewInvitations();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const viewInvitation = createAsyncThunk(
    "groups/viewInvitationById",
    async (groupId: string, { rejectWithValue }) => {
        try {
            const response = await groupApis.viewInvitation(groupId);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const searchMembers = createAsyncThunk(
    "groups/searchMembers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await groupApis.searchMembers();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Slice
export const groupSlice = createSlice({
    name: "group",
    initialState,
    reducers: {
        clearError: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        resetGroupState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Create Group
        builder
            .addCase(createGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.groups.push(action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // View All Groups
        builder
            .addCase(viewGroups.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(viewGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload;
                state.error = null;
            })
            .addCase(viewGroups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // View Single Group
        builder
            .addCase(viewGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(viewGroup.fulfilled, (state, action) => {
                state.loading = false;
                const existingIndex = state.groups.findIndex((g) => g.id === action.payload.id);
                if (existingIndex > -1) {
                    state.groups[existingIndex] = action.payload;
                } else {
                    state.groups.push(action.payload);
                }
                state.error = null;
            })
            .addCase(viewGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Group
        builder
            .addCase(updateGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateGroup.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.groups.findIndex((g) => g.id === action.payload.id);
                if (index > -1) {
                    state.groups[index] = action.payload;
                }
                state.success = true;
                state.error = null;
            })
            .addCase(updateGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // Send Invitation
        builder
            .addCase(sendInvitation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(sendInvitation.fulfilled, (state, action) => {
                state.loading = false;
                state.createInvite = action.payload;
                state.success = true;
                state.error = null;
            })
            .addCase(sendInvitation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // Accept Invitation
        builder
            .addCase(acceptInvitation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(acceptInvitation.fulfilled, (state, action) => {
                state.loading = false;
                const inviteIndex = state.groupInvite.findIndex((i) => i.groupId === action.payload.groupId);
                if (inviteIndex > -1) {
                    state.groupInvite[inviteIndex].status = "ACCEPTED";
                }
                state.success = true;
                state.error = null;
            })
            .addCase(acceptInvitation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // Decline Invitation
        builder
            .addCase(declineInvitation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(declineInvitation.fulfilled, (state, action) => {
                state.loading = false;
                const inviteIndex = state.groupInvite.findIndex((i) => i.groupId === action.payload.groupId);
                if (inviteIndex > -1) {
                    state.groupInvite[inviteIndex].status = "DECLINED";
                }
                state.success = true;
                state.error = null;
            })
            .addCase(declineInvitation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });

        // View All Invitations
        builder
            .addCase(viewInvitations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(viewInvitations.fulfilled, (state, action) => {
                state.loading = false;
                state.groupInvite = action.payload;
                state.error = null;
            })
            .addCase(viewInvitations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // View Single Invitation
        builder
            .addCase(viewInvitation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(viewInvitation.fulfilled, (state, action) => {
                state.loading = false;
                const existingIndex = state.groupInvite.findIndex((i) => i.groupId === action.payload.groupId);
                if (existingIndex > -1) {
                    state.groupInvite[existingIndex] = action.payload;
                } else {
                    state.groupInvite.push(action.payload);
                }
                state.error = null;
            })
            .addCase(viewInvitation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Search Members
        builder
            .addCase(searchMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.groupMember = action.payload;
                state.error = null;
            })
            .addCase(searchMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSuccess, resetGroupState } = groupSlice.actions;
export default groupSlice.reducer;