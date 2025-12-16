import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/* =====================================
   CREATE INTERVIEW (SCHEDULE)
===================================== */
export const createInterview = createAsyncThunk(
  "interview/createInterview",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/interview/schedule", payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to schedule interview"
      );
    }
  }
);

/* =====================================
   SLICE
===================================== */
const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    loading: false,
    success: false,
    error: null,
    interviewId: null,
  },
  reducers: {
    resetInterviewState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.interviewId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE INTERVIEW
      .addCase(createInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.interviewId = action.payload.interviewId;
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetInterviewState } = interviewSlice.actions;
export default interviewSlice.reducer;
