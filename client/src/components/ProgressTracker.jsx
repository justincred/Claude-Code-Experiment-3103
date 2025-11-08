import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiArrowLeft, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import "./ProgressTracker.css";

function ProgressTracker({ documentId, onBack, onQuiz }) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, [documentId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/study/progress/${documentId}`
            );
            setProgress(response.data);
        } catch (error) {
            console.error("Error fetching progress:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="progress-tracker">
                <div className="loading">Loading progress...</div>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="progress-tracker">
                <button className="btn btn-secondary back-btn" onClick={onBack}>
                    <FiArrowLeft /> Back to Documents
                </button>
                <div className="error-message">
                    Could not load progress data
                </div>
            </div>
        );
    }

    const accuracy =
        progress.stats.reviewed > 0
            ? Math.round(
                  (progress.stats.correct / progress.stats.reviewed) * 100
              )
            : 0;

    const completionPercentage = Math.round(
        (progress.stats.reviewed / (progress.totalConcepts * 5)) * 100
    );

    return (
        <div className="progress-tracker">
            <button className="btn btn-secondary back-btn" onClick={onBack}>
                <FiArrowLeft /> Back to Documents
            </button>

            <div className="progress-container">
                <div className="progress-header">
                    <h1>📊 Your Study Progress</h1>
                    <p>Track your learning journey</p>
                </div>

                <div className="progress-cards">
                    {/* Overall Progress Card */}
                    <div className="progress-card large">
                        <div className="card-header">
                            <h2>Overall Progress</h2>
                            <FiTrendingUp className="card-icon" />
                        </div>
                        <div className="circular-progress">
                            <svg
                                viewBox="0 0 100 100"
                                className="progress-circle"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    className="progress-bg"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    className="progress-fill"
                                    style={{
                                        strokeDasharray: `${
                                            (completionPercentage / 100) * 283
                                        } 283`,
                                    }}
                                />
                            </svg>
                            <div className="progress-text">
                                <span className="percentage">
                                    {completionPercentage}%
                                </span>
                                <span className="label">Complete</span>
                            </div>
                        </div>
                    </div>

                    {/* Accuracy Card */}
                    <div className="progress-card">
                        <div className="card-header">
                            <h3>Accuracy Rate</h3>
                        </div>
                        <div className="stat-large">
                            <span
                                className="value"
                                style={{
                                    color:
                                        accuracy >= 80
                                            ? "#22c55e"
                                            : accuracy >= 60
                                            ? "#f59e0b"
                                            : "#ef4444",
                                }}
                            >
                                {accuracy}%
                            </span>
                            <span className="label">
                                {accuracy >= 80
                                    ? "🌟 Excellent"
                                    : accuracy >= 60
                                    ? "👍 Good"
                                    : "📚 Keep Studying"}
                            </span>
                        </div>
                    </div>

                    {/* Questions Reviewed Card */}
                    <div className="progress-card">
                        <div className="card-header">
                            <h3>Questions Reviewed</h3>
                        </div>
                        <div className="stat-large">
                            <span className="value">
                                {progress.stats.reviewed}
                            </span>
                            <span className="label">
                                of {progress.totalConcepts * 5} possible
                            </span>
                        </div>
                    </div>

                    {/* Correct Answers Card */}
                    <div className="progress-card">
                        <div className="card-header">
                            <h3>Correct Answers</h3>
                        </div>
                        <div className="stat-large correct">
                            <span className="value">
                                {progress.stats.correct}
                            </span>
                            <span className="label">
                                {progress.stats.reviewed -
                                    progress.stats.correct}{" "}
                                to improve
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="detailed-stats">
                    <h2>Study Statistics</h2>
                    <div className="stats-table">
                        <div className="stat-row">
                            <span className="stat-label">Total Concepts</span>
                            <span className="stat-value">
                                {progress.totalConcepts}
                            </span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">
                                Questions per Concept
                            </span>
                            <span className="stat-value">5</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">
                                Total Possible Questions
                            </span>
                            <span className="stat-value">
                                {progress.totalConcepts * 5}
                            </span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">
                                Questions Answered
                            </span>
                            <span className="stat-value correct">
                                {progress.stats.reviewed}
                            </span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">Correct Answers</span>
                            <span className="stat-value success">
                                {progress.stats.correct}
                            </span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">
                                Incorrect Answers
                            </span>
                            <span className="stat-value error">
                                {progress.stats.incorrect}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="recommendations">
                    <h2>📝 Recommendations</h2>
                    {progress.stats.reviewed === 0 ? (
                        <div className="recommendation-item">
                            <p>
                                You haven't started studying yet. Begin your
                                quiz to track progress!
                            </p>
                        </div>
                    ) : accuracy >= 80 ? (
                        <>
                            <div className="recommendation-item success">
                                <p>
                                    ✨ Excellent work! You're showing strong
                                    understanding. Review marked concepts one
                                    more time before your quiz.
                                </p>
                            </div>
                        </>
                    ) : accuracy >= 60 ? (
                        <>
                            <div className="recommendation-item warning">
                                <p>
                                    👍 Good progress! Focus on the concepts
                                    where you had incorrect answers.
                                </p>
                            </div>
                            <div className="recommendation-item warning">
                                <p>
                                    📚 Review the explanations and take more
                                    practice questions to improve.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="recommendation-item error">
                                <p>
                                    🎯 Keep practicing! You have time before
                                    your quiz. Review all concepts and retake
                                    the questions.
                                </p>
                            </div>
                            <div className="recommendation-item error">
                                <p>
                                    💡 Focus on understanding the why behind
                                    each answer, not just memorization.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Action Button */}
                <button className="btn btn-primary btn-large" onClick={onQuiz}>
                    <FiCheckCircle /> Continue Studying
                </button>
            </div>
        </div>
    );
}

export default ProgressTracker;
