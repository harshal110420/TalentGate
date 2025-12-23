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

export const fetchMyInterviews = createAsyncThunk(
  "interview/fetchMyInterviews",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/interview/my");
      return res.data.interviews;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch my interviews");
    }
  }
);

export const fetchAllInterviews = createAsyncThunk(
  "interview/fetchAllInterviews",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/interview/all");
      return res.data.interviews;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch all interviews");
    }
  }
);

const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    loading: false,
    candidates: [],
    myInterviews: [],
    allInterviews: [],
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
      })
      // =====================
      // MY INTERVIEWS
      // =====================
      .addCase(fetchMyInterviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.myInterviews = action.payload;
      })
      .addCase(fetchMyInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================
      // ALL INTERVIEWS
      // =====================
      .addCase(fetchAllInterviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.allInterviews = action.payload;
      })
      .addCase(fetchAllInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default interviewSlice.reducer;
