import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance";

export const downloadExamResultPDF = createAsyncThunk(
  "examResult/downloadPDF",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/exam_results/generate-pdf/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ExamResult_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to download exam PDF"
      );
    }
  }
);

const examResultPdfSlice = createSlice({
  name: "examResultPdf",
  initialState: { downloading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(downloadExamResultPDF.pending, (state) => {
        state.downloading = true;
        state.error = null;
      })
      .addCase(downloadExamResultPDF.fulfilled, (state) => {
        state.downloading = false;
      })
      .addCase(downloadExamResultPDF.rejected, (state, action) => {
        state.downloading = false;
        state.error = action.payload;
      });
  },
});

export default examResultPdfSlice.reducer;
