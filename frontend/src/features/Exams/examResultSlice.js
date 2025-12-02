import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance";

// ✅ All exam results (flat)
export const fetchExamResults = createAsyncThunk(
  "examResult/fetchExamResults",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/exam_results/get_all_exams");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Grouped by candidate (unique candidates list)
export const fetchExamResultsGrouped = createAsyncThunk(
  "examResult/fetchGrouped",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/exam_results/by-candidate");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

export const fetchExamResultsByCandidate = createAsyncThunk(
  "examResult/fetchExamResultsByCandidate",
  async (candidateId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/exam_results/${candidateId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch exam results"
      );
    }
  }
);

const examResultSlice = createSlice({
  name: "examResult",
  initialState: {
    list: [],
    groupedList: [],
    single: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Normal results
      .addCase(fetchExamResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamResults.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchExamResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Grouped results (unique candidates)
      .addCase(fetchExamResultsGrouped.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamResultsGrouped.fulfilled, (state, action) => {
        state.loading = false;
        state.groupedList = action.payload;
      })
      .addCase(fetchExamResultsGrouped.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExamResultsByCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamResultsByCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.candidateResults = action.payload;
      })
      .addCase(fetchExamResultsByCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default examResultSlice.reducer;
