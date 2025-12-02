import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchExams = createAsyncThunk(
  "exam/fetchExams",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/exam/all");
      return res.data.exams || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch exams"
      );
    }
  }
);

export const fetchAllExams = createAsyncThunk(
  "exam/fetchAllExams",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/exam/all_exams");
      return res.data.exams || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch exams"
      );
    }
  }
);

export const createExam = createAsyncThunk(
  "exam/createExam",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/exam/create_exam", data);
      return res.data.exam;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create exam"
      );
    }
  }
);

export const fetchExamById = createAsyncThunk(
  "exam/fetchExamById",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/exam/get/${id}`);
      return res.data.exam;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch exam"
      );
    }
  }
);

export const updateExam = createAsyncThunk(
  "exam/updateExam",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/exam/update/${id}`, data);
      return res.data.exam;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const examSlice = createSlice({
  name: "exam",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedExam: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllExams.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchExamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.loading = false;
        const updatedExam = action.payload;
        const index = state.list.findIndex((e) => e.id === updatedExam.id);
        if (index !== -1) {
          state.list[index] = updatedExam;
        }
        if (state.selected && state.selected.id === updatedExam.id) {
          state.selected = updatedExam;
        }
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedExam } = examSlice.actions;
export default examSlice.reducer;
