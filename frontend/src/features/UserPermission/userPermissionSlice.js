import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/* ---------------------------------------------------------
   ✅ Fetch LOGGED IN USER Permissions (SIDEBAR / APP)
--------------------------------------------------------- */
export const fetchMyPermissions = createAsyncThunk(
  "userPermission/fetchMyPermissions",
  async (userId, thunkAPI) => {
    try {
      if (!userId) throw new Error("User id missing");

      console.log("fetchMyPermissions:", userId);

      const res = await axiosInstance.get(
        `/userPermission/getPermissionbyuser/${userId}`
      );

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Failed to load permissions" }
      );
    }
  }
);

/* ---------------------------------------------------------
   ✅ Fetch PERMISSIONS OF SELECTED USER (PERMISSION FORM)
--------------------------------------------------------- */
export const fetchPermissionsByUser = createAsyncThunk(
  "userPermission/fetchPermissionsByUser",
  async (userId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/userPermission/getPermissionbyuser/${userId}`
      );

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Failed to fetch user permissions" }
      );
    }
  }
);

/* ---------------------------------------------------------
   ✅ Save OR Update Permission
--------------------------------------------------------- */
export const saveUserPermission = createAsyncThunk(
  "userPermission/saveUserPermission",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        "/userPermission/createPermissionByUser",
        data
      );

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Save permission failed" }
      );
    }
  }
);

/* ---------------------------------------------------------
   ✅ STATE ISOLATION
--------------------------------------------------------- */
const initialState = {
  // 🔐 logged-in user permissions (SIDEBAR)
  loggedInUserPermissions: [],

  // 🎯 editing user permissions (FORM)
  selectedUserPermissions: [],

  loading: false,
  saving: false,
  error: null,
};

/* ---------------------------------------------------------
   ✅ SLICE
--------------------------------------------------------- */
const userPermissionSlice = createSlice({
  name: "userPermission",
  initialState,

  reducers: {
    clearSelectedPermissions: (state) => {
      state.selectedUserPermissions = [];
    },
  },

  extraReducers: (builder) => {
    /* -------------------------------
       FETCH MY PERMISSIONS (LOGIN USER)
    ------------------------------- */
    builder
      .addCase(fetchMyPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.loggedInUserPermissions = action.payload;
      })
      .addCase(fetchMyPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Sidebar permission load failed";
      });

    /* -------------------------------
       FETCH SELECTED USER
    ------------------------------- */
    builder
      .addCase(fetchPermissionsByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPermissionsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUserPermissions = action.payload;
      })
      .addCase(fetchPermissionsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "User permission fetch failed";
      });

    /* -------------------------------
       SAVE PERMISSION
    ------------------------------- */
    builder
      .addCase(saveUserPermission.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveUserPermission.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveUserPermission.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || "Saving permission failed";
      });
  },
});

export const { clearSelectedPermissions } = userPermissionSlice.actions;
export default userPermissionSlice.reducer;
