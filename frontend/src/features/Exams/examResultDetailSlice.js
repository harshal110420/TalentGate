// src/features/Exams/examResultDetailSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance";

export const fetchExamResultById = createAsyncThunk(
  "examResultDetail/fetchExamResultById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/exam_results/get_exam_by_id/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch exam result"
      );
    }
  }
);

const examResultDetailSlice = createSlice({
  name: "examResultDetail",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamResultById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchExamResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default examResultDetailSlice.reducer;
