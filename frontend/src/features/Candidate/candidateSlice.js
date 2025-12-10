import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunks
export const fetchCandidates = createAsyncThunk(
  "candidate/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/candidate/all");
      return res.data.candidates;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch candidates"
      );
    }
  }
);

export const fetchAllCandidates = createAsyncThunk(
  "candidate/fetchAllCandidates",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/candidate/all_candidates");
      return res.data.candidates;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch candidates"
      );
    }
  }
);

export const createCandidate = createAsyncThunk(
  "candidate/create",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/candidate/create", data);
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Candidate creation failed"
      );
    }
  }
);

export const updateCandidate = createAsyncThunk(
  "candidate/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/candidate/${id}`, data);
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Candidate update failed"
      );
    }
  }
);

export const markResumeReviewed = createAsyncThunk(
  "candidate/resumeReviewed",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/candidate/mark-resume-reviewed/${id}`
      );
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Marking resume reviewed failed"
      );
    }
  }
);

export const shortlistCandidate = createAsyncThunk(
  "candidate/shortlist",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/candidate/shortlist/${id}`);
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Shortlisting failed"
      );
    }
  }
);

export const rejectCandidate = createAsyncThunk(
  "candidate/rejectCandidate",
  async ({ id, remarks }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(`/candidate/reject/${id}`, {
        remarks,
      });
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Candidate rejection failed"
      );
    }
  }
);

export const scheduleInterview = createAsyncThunk(
  "candidate/scheduleInterview",
  async ({ id, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/candidate/schedule-interview/${id}`,
        payload
      );
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Interview scheduling failed"
      );
    }
  }
);

export const markInterviewPassed = createAsyncThunk(
  "candidate/interviewPassed",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/candidate/interview-passed/${id}`
      );
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Interview pass failed"
      );
    }
  }
);

export const markSelected = createAsyncThunk(
  "candidate/markSelected",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(`/candidate/select/${id}`);
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Selection failed"
      );
    }
  }
);

export const deleteCandidate = createAsyncThunk(
  "candidate/delete",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/candidate/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Candidate delete failed"
      );
    }
  }
);

export const fetchCandidateById = createAsyncThunk(
  "candidate/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/candidate/${id}`);
      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch candidate"
      );
    }
  }
);

export const reassignExam = createAsyncThunk(
  "candidate/reassignExam",
  async ({ candidateId, examId }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/candidate/reassign-exam`, {
        candidateId,
        examId,
      });
      return res.data; // message + updated candidate
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Reassigning exam failed"
      );
    }
  }
);

export const markHired = createAsyncThunk(
  "candidate/markHired",
  async ({ id, joiningDate }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(`/candidate/hire/${id}`, {
        joiningDate,
      });

      return res.data.candidate;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Hiring failed"
      );
    }
  }
);

const candidateSlice = createSlice({
  name: "candidate",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
    createSuccess: false,
    updateSuccess: false,
    exams: [], // No API, so always empty
  },
  reducers: {
    clearSelectedCandidate: (state) => {
      state.selected = null;
    },
    resetCandidateStatus: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.list = []; // 👈 add this line
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all candidate
      .addCase(fetchAllCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.list = []; // 👈 add this line
      })
      .addCase(fetchAllCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createCandidate.pending, (state) => {
        state.loading = true;
        state.createSuccess = false;
        state.error = null;
      })
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.list.unshift(action.payload);
      })
      .addCase(createCandidate.rejected, (state, action) => {
        state.loading = false;
        state.createSuccess = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateCandidate.pending, (state) => {
        state.loading = true;
        state.updateSuccess = false;
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.loading = false;
        state.updateSuccess = false;
        state.error = action.payload;
      })

      .addCase(markResumeReviewed.pending, (state) => {
        state.loading = true;
      })
      .addCase(markResumeReviewed.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.list.findIndex((c) => c.id === updated.id);
        if (idx !== -1) {
          state.list[idx] = updated;
        }
      })
      .addCase(markResumeReviewed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(shortlistCandidate.pending, (state) => {
        state.loading = true;
      })
      .addCase(shortlistCandidate.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;
        const idx = state.list.findIndex((c) => c.id === updated.id);

        if (idx !== -1) {
          state.list[idx] = updated;
        }

        if (state.selected?.id === updated.id) {
          state.selected = updated;
        }
      })
      .addCase(shortlistCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject
      .addCase(rejectCandidate.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectCandidate.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        // update list
        const idx = state.list.findIndex((c) => c.id === updated.id);
        if (idx !== -1) {
          state.list[idx] = updated;
        }

        // update selected if same
        if (state.selected?.id === updated.id) {
          state.selected = updated;
        }
      })
      .addCase(rejectCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(scheduleInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;
        const idx = state.list.findIndex((c) => c.id === updated.id);

        if (idx !== -1) {
          state.list[idx] = updated;
        }
        if (state.selected?.id === updated.id) {
          state.selected = updated;
        }
      })
      .addCase(scheduleInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ INTERVIEW PASSED
      .addCase(markInterviewPassed.pending, (state) => {
        state.loading = true;
      })
      .addCase(markInterviewPassed.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        const idx = state.list.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.list[idx] = updated;

        if (state.selected?.id === updated.id) {
          state.selected = updated;
        }
      })
      .addCase(markInterviewPassed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ SELECTED
      .addCase(markSelected.pending, (state) => {
        state.loading = true;
      })
      .addCase(markSelected.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        const idx = state.list.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.list[idx] = updated;

        if (state.selected?.id === updated.id) {
          state.selected = updated;
        }
      })
      .addCase(markSelected.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ HIRED
      .addCase(markHired.pending, (state) => {
        state.loading = true;
      })
      .addCase(markHired.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        const idx = state.list.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.list[idx] = updated;

        if (state.selected?.id === updated.id) {
          state.selected = updated;
        }
      })
      .addCase(markHired.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      // Fetch by ID
      .addCase(fetchCandidateById.pending, (state) => {
        state.loading = true;
        state.selected = null;
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.loading = false;
        state.selected = null;
        state.error = action.payload;
      })
      .addCase(reassignExam.pending, (state) => {
        state.loading = true;
      })
      .addCase(reassignExam.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.candidate;

        const idx = state.list.findIndex((c) => c.id === updated.id);
        if (idx !== -1) {
          state.list[idx] = updated;
        }
      });
  },
});

export const { clearSelectedCandidate, resetCandidateStatus } =
  candidateSlice.actions;
export default candidateSlice.reducer;
