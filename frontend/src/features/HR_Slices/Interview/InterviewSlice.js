import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// SIMPLE THUNK
export const fetchCandidatesOverview = createAsyncThunk(
  "interview/fetchCandidatesOverview",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/interview/overview");
      console.log("API DATA =>", res.data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch candidates");
    }
  }
);

const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    loading: false,
    candidates: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidatesOverview.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidatesOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload.candidates || [];
      })
      .addCase(fetchCandidatesOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default interviewSlice.reducer;
