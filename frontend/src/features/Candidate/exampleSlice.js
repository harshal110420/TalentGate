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
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Candidate update failed"
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

// export const fetchExams = createAsyncThunk(
//   "candidate/fetchExams",
//   async (_, thunkAPI) => {
//     try {
//       const res = await axiosInstance.get("/exam/all");
//       return res.data.exams;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(
//         err.response?.data?.message || "Failed to fetch exams"
//       );
//     }
//   }
// );

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
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
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
        const { candidate, generatedPassword } = action.payload;

        state.loading = false;
        state.updateSuccess = true;

        const idx = state.list.findIndex((c) => c.id === candidate.id);
        if (idx !== -1) {
          state.list[idx] = candidate;
        }

        // 👇 Optional: Store the new password in Redux if needed
        if (generatedPassword) {
          state.generatedPassword = generatedPassword;
        }
      })

      .addCase(updateCandidate.rejected, (state, action) => {
        state.loading = false;
        state.updateSuccess = false;
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
      });
    // Fetch Exams
    // .addCase(fetchExams.pending, (state) => {
    //   state.loading = true;
    // })
    // .addCase(fetchExams.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.exams = action.payload;
    // })
    // .addCase(fetchExams.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

export const { clearSelectedCandidate, resetCandidateStatus } =
  candidateSlice.actions;
export default candidateSlice.reducer;
