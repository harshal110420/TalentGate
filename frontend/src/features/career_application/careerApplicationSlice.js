import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// 📦 Fetch paginated + searchable career applications
export const fetchCareerApplication = createAsyncThunk(
  "careerApplication/fetchCareerApplication",
  async ({ page = 1, limit = 20, search = "" } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        "/website/careers/get_all_application",
        {
          params: { page, limit, search },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const careerApplicationSlice = createSlice({
  name: "careerApplication",
  initialState: {
    applications: [],
    pagination: {
      total: 0,
      page: 1,
      totalPages: 1,
      limit: 20,
    },
    loading: false,
    error: null,
    search: "",
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCareerApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCareerApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCareerApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch career applications";
      });
  },
});

export const { setSearch } = careerApplicationSlice.actions;
export default careerApplicationSlice.reducer;
