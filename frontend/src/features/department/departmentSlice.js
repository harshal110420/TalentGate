import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { all } from "axios";

// 📦 Fetch all departments
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/department/all");
      return res.data.departments;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAllDepartments = createAsyncThunk(
  "departments/fetchAllDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/department/all_departments");
      return res.data.departments;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ➕ Create department
export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/department/create", data);
      return res.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🔄 Update department
export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/department/update/${id}`, data);
      return res.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ❌ Delete department
export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/department/delete/${id}`);
      return id; // Just return id for filtering from state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🔍 Get single department by ID
export const getDepartmentById = createAsyncThunk(
  "departments/getDepartmentById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/department/get/${id}`);
      return res.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    list: [],
    loading: false,
    error: null,
    selected: null,
  },
  reducers: {
    clearDepartments: (state) => {
      state.list = [];
      state.selected = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch All
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ➕ Create
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔄 Update
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ❌ Delete
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔍 Get by ID
      .addCase(getDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch All Departments (no permission check)
      .addCase(fetchAllDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDepartments } = departmentSlice.actions;

export default departmentSlice.reducer;
