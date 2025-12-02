import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// 📦 Fetch all Levels
export const fetchLevels = createAsyncThunk(
  "levels/fetchLevels",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/level/all");
      return res.data.levels;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 📦 Fetch all Levels
export const fetchAllLevels = createAsyncThunk(
  "levels/fetchAllLevels",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/level/all_levels");
      return res.data.levels;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ➕ Create Level
export const createLevel = createAsyncThunk(
  "levels/createLevel",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/level/create", data);
      return res.data.levels;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🔄 Update Level
export const updateLevel = createAsyncThunk(
  "levels/updateLevel",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/level/update/${id}`, data);
      return res.data.level;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ❌ Delete Level
export const deleteLevel = createAsyncThunk(
  "levels/deleteLevel",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/level/delete/${id}`);
      return id; // Just return id for filtering from state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🔍 Get single Level by ID
export const getLevelById = createAsyncThunk(
  "levels/getLevelById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/level/get/${id}`);
      return res.data.level;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const levelSlice = createSlice({
  name: "levels",
  initialState: {
    list: [],
    loading: false,
    error: null,
    selected: null,
  },
  reducers: {
    clearLevels: (state) => {
      state.list = [];
      state.selected = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch All
      .addCase(fetchLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch All
      .addCase(fetchAllLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ➕ Create
      .addCase(createLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔄 Update
      .addCase(updateLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLevel.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ❌ Delete
      .addCase(deleteLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔍 Get by ID
      .addCase(getLevelById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(getLevelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(getLevelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLevels } = levelSlice.actions;

export default levelSlice.reducer;
