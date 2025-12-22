import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

/* =======================
   THUNKS
======================= */

// Fetch all scores for an interview (HR / Admin)
export const fetchInterviewScores = createAsyncThunk(
  "interviewScore/fetchByInterview",
  async (interviewId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/interview-score/${interviewId}/scores`
      );
      return { interviewId, scores: res.data.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch interview scores"
      );
    }
  }
);

// Fetch logged-in interviewer's score
export const fetchMyInterviewScore = createAsyncThunk(
  "interviewScore/fetchMine",
  async (interviewId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/interview-score/${interviewId}/my-score`
      );
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch your score"
      );
    }
  }
);

// Save draft OR submit final score
export const submitInterviewScore = createAsyncThunk(
  "interviewScore/save",
  async ({ interviewId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/interview-score/${interviewId}/submit-score`,
        payload
      );
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to save interview score"
      );
    }
  }
);

/* =======================
   SLICE
======================= */

const interviewScoreSlice = createSlice({
  name: "interviewScore",
  initialState: {
    scoresByInterview: {},
    myScore: null,
    loading: false,
    error: null,
    saveSuccess: false,
    submitSuccess: false,
  },

  reducers: {
    resetInterviewScoreStatus: (state) => {
      state.saveSuccess = false;
      state.submitSuccess = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== FETCH ALL SCORES ===== */
      .addCase(fetchInterviewScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scoresByInterview[action.payload.interviewId] =
          action.payload.scores;
      })
      .addCase(fetchInterviewScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== FETCH MY SCORE ===== */
      .addCase(fetchMyInterviewScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyInterviewScore.fulfilled, (state, action) => {
        state.loading = false;
        state.myScore = action.payload;
      })
      .addCase(fetchMyInterviewScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== SAVE / SUBMIT SCORE ===== */
      .addCase(submitInterviewScore.pending, (state) => {
        state.loading = true;
        state.saveSuccess = false;
        state.submitSuccess = false;
        state.error = null;
      })
      .addCase(submitInterviewScore.fulfilled, (state, action) => {
        state.loading = false;
        state.myScore = action.payload;

        if (action.payload.status === "Submitted") {
          state.submitSuccess = true;
        } else {
          state.saveSuccess = true;
        }
      })
      .addCase(submitInterviewScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetInterviewScoreStatus } = interviewScoreSlice.actions;

export default interviewScoreSlice.reducer;
