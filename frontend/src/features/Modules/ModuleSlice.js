import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// 🔽 Fetch all active modules
export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/modules/all_modules");
      return data; // This should be an array of { _id, name, isActive, orderBy }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllModules = createAsyncThunk(
  "modules/fetchAllModules",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/modules/fetch_all_modules");
      return data; // This should be an array of { _id, name, isActive, orderBy }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 🔽 Get module by ID
export const getModuleById = createAsyncThunk(
  "modules/getById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/modules/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 🔽 Create module
export const createModule = createAsyncThunk(
  "modules/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/modules", formData);
      return data.module;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 🔽 Update module
export const updateModule = createAsyncThunk(
  "modules/update",
  async ({ id, data: formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/modules/${id}`, formData);
      return data.module;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 🔽 Delete module
export const deleteModule = createAsyncThunk(
  "modules/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/modules/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const moduleSlice = createSlice({
  name: "modules",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedModule: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch modules";
      })
      .addCase(fetchAllModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch modules";
      })
      // Get by ID
      .addCase(getModuleById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(getModuleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(getModuleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch module";
      })
      // Create
      .addCase(createModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create module";
      })
      // Update
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (mod) => mod.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update module";
      })
      // Delete
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.list = state.list.filter((mod) => mod.id !== action.payload);
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete module";
      });
  },
});

export default moduleSlice.reducer;
