// features/interviewScores/interviewScoresSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// 1️⃣ Fetch logged-in interviewer's score
export const fetchMyScore = createAsyncThunk(
  "interviewScores/fetchMyScore",
  async (interviewId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `interview-score/${interviewId}/my-score`
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 2️⃣ Fetch all scores for an interview (HR/Admin view)
export const fetchAllScores = createAsyncThunk(
  "interviewScores/fetchAllScores",
  async (interviewId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `interview-score/${interviewId}/scores`
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 3️⃣ Save or update draft
export const saveDraftScore = createAsyncThunk(
  "interviewScores/saveDraftScore",
  async ({ interviewId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `interview-score/${interviewId}/draft`,
        payload
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 4️⃣ Submit final score
export const submitFinalScore = createAsyncThunk(
  "interviewScores/submitFinalScore",
  async ({ interviewId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `interview-score/${interviewId}/submit`,
        payload
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🔒 Lock Interview Scores
export const lockInterviewScores = createAsyncThunk(
  "interviewScore/lockInterviewScores",
  async (interviewId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/interview-score/${interviewId}/lock`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to lock interview scores"
      );
    }
  }
);

// ------------------------------------
// Slice
// ------------------------------------
const interviewScoresSlice = createSlice({
  name: "interviewScores",
  initialState: {
    myScore: null,
    allScores: [],
    loading: false,
    error: null,
    lockSuccess: false,
  },
  reducers: {
    clearScores: (state) => {
      state.myScore = null;
      state.allScores = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // ---------------- My Score ----------------
    builder
      .addCase(fetchMyScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyScore.fulfilled, (state, action) => {
        state.loading = false;
        state.myScore = action.payload;
      })
      .addCase(fetchMyScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ---------------- All Scores ----------------
    builder
      .addCase(fetchAllScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllScores.fulfilled, (state, action) => {
        state.loading = false;
        state.allScores = action.payload;
      })
      .addCase(fetchAllScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ---------------- Save Draft ----------------
    builder
      .addCase(saveDraftScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveDraftScore.fulfilled, (state, action) => {
        state.loading = false;
        state.myScore = action.payload;
      })
      .addCase(saveDraftScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ---------------- Submit Final ----------------
    builder
      .addCase(submitFinalScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitFinalScore.fulfilled, (state, action) => {
        state.loading = false;
        state.myScore = action.payload;
      })
      .addCase(submitFinalScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOCK
      .addCase(lockInterviewScores.pending, (state) => {
        state.loading = true;
        state.lockSuccess = false;
      })
      .addCase(lockInterviewScores.fulfilled, (state) => {
        state.loading = false;
        state.lockSuccess = true;

        // UI sync
        state.allScores = state.allScores.map((s) => ({
          ...s,
          status: "Locked",
        }));
      })
      .addCase(lockInterviewScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearScores } = interviewScoresSlice.actions;
export default interviewScoresSlice.reducer;
