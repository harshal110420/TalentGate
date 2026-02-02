import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCards";
import QuestionTimer from "../components/QuestionTimer";
import axiosInstance from "../api/axiosInstance";
import Timebar from "../components/common/Timebar";




const ExamUIPreview = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);


  useEffect(() => {
    const root = document.documentElement;

    // remove dark class if present
    root.classList.remove("dark");

    // set background + text color for the page
    root.style.backgroundColor = "#ffffff";
    root.style.color = "#111827"; // Tailwind text-gray-900 color

    // cleanup on unmount
    return () => {
      root.style.backgroundColor = "";
      root.style.color = "";
    };
  }, []);


  // ✅ Fetch Exam Data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/exam/start-ui?token=${token}`);
        const data = res.data.exam;
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Failed to fetch exam data:", err);
        alert(
          "Unable to load your exam data. Please check your link or try again."
        );
        navigate("/exam-completed", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchExamData();
  }, [token, navigate]);

  // ✅ Reload Protection
  useEffect(() => {
    if (sessionStorage.getItem("examReloaded") === "true") {
      sessionStorage.removeItem("examReloaded");
      submitExam(true);
      return;
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "Do you really want to reload? This will auto-submit your exam.";
      sessionStorage.setItem("examReloaded", "true");
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        const confirmReload = window.confirm(
          "Do you really want to reload? This will auto-submit your exam."
        );
        if (confirmReload) {
          sessionStorage.setItem("examReloaded", "true");
          window.location.reload();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 🚨 Ultimate Exam Security: Auto-submit on Tab Switch / Blur / ALT+TAB
  useEffect(() => {
    const autoSubmit = (reason) => {
      if (isSubmittingRef.current) return;
      console.warn(`Exam auto-submitted due to: ${reason}`);
      submitExam(false, true);
    };


    // 1️⃣ TAB SWITCH (visibility change)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        autoSubmit("Tab Switch / User Left Exam Tab");
      }
    };

    // 2️⃣ ALT + TAB detection
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key === "Tab") || e.key === "Meta") {
        autoSubmit("ALT+TAB or CMD detected");
      }
    };

    // 3️⃣ Window blur (Minimize / focus lost)
    const handleBlur = () => {
      autoSubmit("Window Minimized or Focus Lost");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);


  // 🚨 ESC key → Auto-submit exam
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (isSubmittingRef.current) return;
        submitExam(false, true);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);



  // 🚫 Disable Right-Click, Copy, Paste & Force Fullscreen
  useEffect(() => {
    const preventAction = (e) => e.preventDefault();

    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);

    // Force Fullscreen ONCE
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }

    return () => {
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFullscreen) {
        // 🚨 User exited fullscreen → auto submit exam
        submitExam(false, true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);


  // ✅ Handle Option Selection
  const handleOptionSelect = (qid, option) => {
    setResponses((prev) => {
      const updated = { ...prev };
      if (option === null) delete updated[qid];
      else updated[qid] = String(option).trim();
      return updated;
    });

    // Remove from skipped if previously marked
    setSkippedQuestions((prev) => prev.filter((id) => id !== qid));
  };

  // ✅ Manual Skip
  const handleSkipQuestion = () => {
    const currentQid = questions[currentQIndex]?.id;
    if (!currentQid) return;

    if (!responses[currentQid] && !skippedQuestions.includes(currentQid)) {
      setSkippedQuestions((prev) => [...prev, currentQid]);
    }

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      submitExam();
    }
  };

  // ✅ Auto Skip on Timer End
  const handleAutoSkip = () => {
    const currentQid = questions[currentQIndex]?.id;
    if (!currentQid) return;

    if (!responses[currentQid] && !skippedQuestions.includes(currentQid)) {
      setSkippedQuestions((prev) => [...prev, currentQid]);
    }

    if (currentQIndex === questions.length - 1) {
      setTimeout(() => submitExam(false, true), 300);
    } else {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  // ✅ Submit Exam
  const submitExam = async (fromReload = false, fromAuto = false) => {
    if (isSubmittingRef.current || isSubmitting) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        token,
        responses: Object.entries(responses).map(([qid, selectedOption]) => ({
          questionId: Number(qid),
          selectedOption: String(selectedOption).trim(),
        })),
        skippedQuestions,
        submissionType: fromAuto || fromReload ? "AUTO" : "MANUAL",
      };

      const res = await axiosInstance.post("/exam/submit-exam", payload);

      if (res.status === 200) {
        console.log("✅ Exam submission success:", res.data);

        if (fromReload || fromAuto) {
          navigate("/exam-completed", { replace: true });
        } else {
          setShowSubmitModal(true);
        }
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err) {
      console.error("❌ Submit error:", err.response?.data || err.message);

      if (
        err.response?.status === 200 ||
        err.response?.data?.message?.includes("already submitted") ||
        err.message.includes("Network Error")
      ) {
        navigate("/exam-completed", { replace: true });
      } else {
        alert("Failed to submit exam. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Loading exam, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <div className="w-full">
        <Timebar
          key={questions[currentQIndex]?.id}
          questionId={questions[currentQIndex]?.id}
          timeLimit={questions[currentQIndex]?.timeLimit || 20}
          onTimeUp={handleAutoSkip}
        />
      </div>


      {/* Main Panel */}
      <div className="flex-1 p-4 bg-gray-50 min-h-screen flex flex-col items-center">

        {/* ⚠️ Tooltip for Last Question */}
        {questions.length > 0 && currentQIndex === questions.length - 1 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-md text-sm font-medium animate-pulse z-50">
            ⚠️ This is your last question! Please submit before the timer ends.
          </div>
        )}

        <div className="w-full mx-auto flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Talent Gate | Assessment
            </h1>
            {questions.length > 0 && (
              <p className="text-gray-500 text-sm mt-1">
                Question {currentQIndex + 1} of {questions.length}
              </p>
            )}
          </div>

          {questions.length > 0 && (
            <div className="px-3 py-2 rounded-xl bg-white shadow-md border border-gray-200">
              <QuestionTimer
                key={questions[currentQIndex]?.id}
                questionIndex={currentQIndex}
                timeLimit={questions[currentQIndex]?.timeLimit || 20}
                onTimeUp={handleAutoSkip}
              />
            </div>
          )}
        </div>

        {/* Question Card */}
        {questions.length > 0 && (
          <div className="p-6 w-full mx-auto">

            <QuestionCard
              question={questions[currentQIndex]}
              questionNumber={currentQIndex + 1}
              selectedOption={responses[questions[currentQIndex].id]}
              onSelect={(opt) =>
                handleOptionSelect(questions[currentQIndex].id, opt)
              }
            />

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleSkipQuestion}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg shadow-sm font-medium transition ${isSubmitting
                  ? "bg-gray-200 cursor-not-allowed text-gray-400"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
              >
                Skip Question
              </button>

              {currentQIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex((prev) => prev + 1)}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg shadow-sm font-medium transition ${isSubmitting
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => submitExam(false)}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg shadow-sm font-medium transition ${isSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Exam"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Submit Success Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              ✅ Exam Submitted!
            </h2>
            <p className="mb-6">
              Your exam has been successfully submitted. Thank you!
            </p>
            <button
              onClick={() => navigate("/exam-completed", { replace: true })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm font-medium transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamUIPreview;
