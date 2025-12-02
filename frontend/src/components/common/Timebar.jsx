import React, { useEffect, useState } from "react";

const Timebar = ({ timeLimit = 20, onTimeUp, questionId }) => {
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    // 🕒 Reset whenever a new questionId or timeLimit comes
    useEffect(() => {
        setTimeLeft(timeLimit);
    }, [questionId, timeLimit]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onTimeUp, questionId]); // 👈 depend on questionId so new timer starts each time

    const progressPercent = (timeLeft / timeLimit) * 100;

    const getColor = () => {
        if (progressPercent > 60) return "#22c55e"; // green
        if (progressPercent > 30) return "#eab308"; // yellow
        return "#ef4444"; // red
    };

    return (
        <div className="w-full h-3 bg-gray-200 overflow-hidden shadow-inner">
            <div
                className="h-full"
                style={{
                    width: `${progressPercent}%`,
                    backgroundColor: getColor(),
                    transition: "width 1s linear, background-color 0.5s ease",
                }}
            ></div>
        </div>
    );
};

export default Timebar;
