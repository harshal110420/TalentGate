import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"; // Adjust if needed

// 🔹 Fetch all subjects
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchSubjects",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/subject/all");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          message: "Unknown error while fetching subjects",
        }
      );
    }
  }
);

export const fetchAllSubjects = createAsyncThunk(
  "subjects/fetchAllSubjects",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/subject/all_subjects");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          message: "Unknown error while fetching subjects",
        }
      );
    }
  }
);

// 🔹 Create a subject
export const createSubject = createAsyncThunk(
  "subjects/createSubject",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/subject/create", data);

      // ✅ Refresh the list after creation
      thunkAPI.dispatch(fetchSubjects());

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Error while creating subject" }
      );
    }
  }
);

// 🔹 Update a subject
export const updateSubject = createAsyncThunk(
  "subjects/updateSubject",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/subject/update/${id}`, data);

      // ✅ Refresh the list after update
      thunkAPI.dispatch(fetchSubjects());

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Error while updating subject" }
      );
    }
  }
);

// 🔹 Delete a subject
export const deleteSubject = createAsyncThunk(
  "subjects/deleteSubject",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/subject/delete/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Error while deleting subject" }
      );
    }
  }
);

// 🔹 Get subject by ID
export const getSubjectById = createAsyncThunk(
  "subjects/getSubjectById",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/subject/get/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Error while getting subject by ID" }
      );
    }
  }
);

// Thunk to fetch subjects by department
export const fetchSubjectsByDepartment = createAsyncThunk(
  "subject/fetchSubjectsByDepartment",
  async (departmentId) => {
    try {
      const res = await axiosInstance.get(
        `/subject/by-department/${departmentId}`
      );
      console.log("fetchSubjectsByDepartment:", res.data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          message: "Error while getting department by ID",
        }
      );
    }
  }
);

// 🔸 Slice
const subjectSlice = createSlice({
  name: "subjects",
  initialState: {
    list: [], // <-- use 'list' for subjects array
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSubjects: (state) => {
      state.list = [];
      state.selected = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📚 FETCH ALL
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming API returns { subjects: [...] }
        state.list = action.payload.subjects || [];
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      // 📚 FETCH ALL
      .addCase(fetchAllSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubjects.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming API returns { subjects: [...] }
        state.list = action.payload.subjects || [];
      })
      .addCase(fetchAllSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ➕ CREATE
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubject.fulfilled, (state) => {
        state.loading = false;
        // We already dispatched fetchSubjects to refresh list, so no need to modify list here
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // 🔄 UPDATE
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state) => {
        state.loading = false;
        // List refreshed via fetchSubjects dispatch, no need to update here
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ❌ DELETE
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.loading = false;
        // Manually remove deleted subject from list
        state.list = state.list.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // 🔍 GET BY ID
      .addCase(getSubjectById.pending, (state) => {
        state.loading = true;
        state.selected = null;
        state.error = null;
      })
      .addCase(getSubjectById.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming API returns { subject: {...} }
        state.selected = action.payload.subject;
      })
      .addCase(getSubjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // 🔍 GET SUBJECT BY DEPARTMENT
      .addCase(fetchSubjectsByDepartment.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjectsByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.subjects || action.payload; // Preferably consistent structure
      })
      .addCase(fetchSubjectsByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearSubjects } = subjectSlice.actions;
export default subjectSlice.reducer;
