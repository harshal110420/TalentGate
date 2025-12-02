// services/candidateService.js
import axiosInstance from "../api/axiosInstance";

export const sendCandidateExamMail = async (candidateId) => {
  const res = await axiosInstance.post(
    `/candidate/send-exam-mail/${candidateId}`
  );
  return res.data;
};
