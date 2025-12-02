import axiosInstance from "../api/axiosInstance";

export const fetchQuestionsReport = async (filters) => {
  const res = await axiosInstance.get("/reports/questions", {
    params: filters,
  });
  return res.data.data;
};

export const fetchDetailedQuestionsReport = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axiosInstance.get(`/reports/questions/detailed?${params}`);
  return res.data;
};
// export default { fetchQuestionsReport };
