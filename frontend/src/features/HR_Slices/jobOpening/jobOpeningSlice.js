import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

export const fetchAllJobOpenings = createAsyncThunk(
  "jobOpening/fetchAllJobOpenings",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/job-openings/all_jobs");
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch job openings"
      );
    }
  }
);

export const fetchJobOpenings = createAsyncThunk(
  "jobOpening/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/job-openings/all");
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch job openings"
      );
    }
  }
);

export const createJobOpening = createAsyncThunk(
  "jobOpening/create",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/job-openings/create", data);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Job opening creation failed"
      );
    }
  }
);

export const fetchJobOpeningsById = createAsyncThunk(
  "jobOpening/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/job-openings/${id}`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch job opening"
      );
    }
  }
);

export const updateJobOpening = createAsyncThunk(
  "jobOpening/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/job-openings/${id}`, data);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Job opening update failed"
      );
    }
  }
);

const jobOpeningSlice = createSlice({
  name: "jobOpening",
  initialState: {
    jobOpenings: [],
    selectedJob: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchAllJobOpenings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllJobOpenings.fulfilled, (state, action) => {
        state.loading = false;
        state.jobOpenings = action.payload;
      })
      .addCase(fetchAllJobOpenings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobOpenings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobOpenings.fulfilled, (state, action) => {
        state.loading = false;
        state.jobOpenings = action.payload;
      })
      .addCase(fetchJobOpenings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobOpeningsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobOpeningsById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobOpeningsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createJobOpening.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJobOpening.fulfilled, (state, action) => {
        state.loading = false;
        state.jobOpenings.push(action.payload);
      })
      .addCase(createJobOpening.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateJobOpening.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobOpening.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        state.selectedJob = updated; // ✅ Sync selected item too

        const idx = state.jobOpenings.findIndex((j) => j.id === updated.id);
        if (idx !== -1) state.jobOpenings[idx] = updated;
      })
      .addCase(updateJobOpening.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export default jobOpeningSlice.reducer;
export const {} = jobOpeningSlice.actions;
