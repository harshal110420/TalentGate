import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunks
export const fetchQuestions = createAsyncThunk(
  "questions/fetchAll",
  async (params, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/questions/all", { params });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Fetch failed"
      );
    }
  }
);

export const fetchAllQuestions = createAsyncThunk(
  "questions/fetchAllQuestions",
  async (params, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/questions/all_questions", {
        params,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Fetch failed"
      );
    }
  }
);

export const createQuestion = createAsyncThunk(
  "questions/create",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/questions/create", data);
      return res.data.question;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Create failed"
      );
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "questions/update",
  async (formData, thunkAPI) => {
    try {
      const { id, ...rest } = formData;
      const res = await axiosInstance.put(`/questions/update/${id}`, rest);
      return res.data.question;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Update failed"
      );
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/delete",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/questions/delete/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Delete failed"
      );
    }
  }
);

export const getQuestionById = createAsyncThunk(
  "questions/getById",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/questions/get/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Fetch by ID failed"
      );
    }
  }
);

export const toggleActiveQuestion = createAsyncThunk(
  "questions/toggleActive",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(`/questions/toggle-active/${id}`);
      return res.data.question;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Toggle failed"
      );
    }
  }
);

// 📥 Bulk Upload Questions (Excel)
export const bulkUploadQuestions = createAsyncThunk(
  "questionBanks/bulkUploadQuestions",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/questions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// 📤 Export Questions to Excel
export const exportQuestionsToExcel = createAsyncThunk(
  "questionBanks/exportQuestionsToExcel",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/questions/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "question_bank.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const questionSlice = createSlice({
  name: "questions",
  initialState: {
    list: [],
    selectedQuestion: null,
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    totalPages: 1,
    search: "",
    statusFilter: "all",
    exportLoading: false,
    exportError: null,
    bulkUploadLoading: false,
    bulkUploadError: null,
  },
  reducers: {
    clearSelectedQuestion: (state) => {
      state.selectedQuestion = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.list = []; // 👈 Clear old data instantly to prevent flicker
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.questions;
        state.total = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.list = []; // 👈 Clear old data instantly to prevent flicker
      })
      .addCase(fetchAllQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.questions;
        state.total = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const idx = state.list.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.list = state.list.filter((q) => q.id !== action.payload);
      })
      .addCase(getQuestionById.fulfilled, (state, action) => {
        state.selectedQuestion = action.payload.question;
      })
      .addCase(toggleActiveQuestion.fulfilled, (state, action) => {
        const idx = state.list.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      // Bulk Upload
      .addCase(bulkUploadQuestions.pending, (state) => {
        state.bulkUploadLoading = true;
      })
      .addCase(bulkUploadQuestions.fulfilled, (state) => {
        state.bulkUploadLoading = false;
      })
      .addCase(bulkUploadQuestions.rejected, (state, action) => {
        state.bulkUploadLoading = false;
        state.bulkUploadError = action.payload;
      })

      // Export to Excel
      .addCase(exportQuestionsToExcel.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportQuestionsToExcel.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportQuestionsToExcel.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      });
  },
});

export const {
  clearSelectedQuestion,
  clearError,
  setCurrentPage,
  setSearch,
  setStatusFilter,
} = questionSlice.actions;
export default questionSlice.reducer;
