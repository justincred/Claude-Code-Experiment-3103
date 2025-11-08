import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiArrowLeft, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";
import "./QuizMode.css";

function QuizMode({ documentId, onBack }) {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [showAnswer, setShowAnswer] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        correct: 0,
        incorrect: 0,
        currentScore: 0,
    });
    const [sessionStats, setSessionStats] = useState({
        questionsAnswered: 0,
        correct: 0,
        avgScore: 0,
    });

    useEffect(() => {
        fetchNextQuestion();
        fetchProgress();
    }, [documentId]);

    const fetchNextQuestion = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/study/next-question/${documentId}`
            );

            if (response.data.id) {
                setCurrentQuestion(response.data);
                setUserAnswer("");
                setShowAnswer(false);
                setEvaluation(null);
            } else {
                setCurrentQuestion(null);
            }
        } catch (error) {
            console.error("Error fetching question:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await axios.get(
                `/api/study/progress/${documentId}`
            );
            setStats(response.data.stats);
        } catch (error) {
            console.error("Error fetching progress:", error);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) {
            alert("Please enter an answer");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("/api/study/evaluate", {
                questionId: currentQuestion.id,
                userAnswer,
                conceptId: currentQuestion.conceptId,
            });

            setEvaluation(response.data);
            setShowAnswer(true);

            // Update session stats
            setSessionStats((prev) => ({
                questionsAnswered: prev.questionsAnswered + 1,
                correct: prev.correct + (response.data.isCorrect ? 1 : 0),
                avgScore:
                    (prev.avgScore * prev.questionsAnswered +
                        response.data.score) /
                    (prev.questionsAnswered + 1),
            }));

            // Update overall stats
            fetchProgress();
        } catch (error) {
            console.error("Error evaluating answer:", error);
            alert("Error evaluating answer: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNextQuestion = () => {
        fetchNextQuestion();
    };

    const handleSkip = () => {
        fetchNextQuestion();
    };

    if (loading && !currentQuestion) {
        return (
            <div className="quiz-mode">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading question...</p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="quiz-mode">
                <button className="btn btn-secondary back-btn" onClick={onBack}>
                    <FiArrowLeft /> Back to Documents
                </button>
                <div className="empty-state">
                    <h2>🎉 All done!</h2>
                    <p>You've reviewed all available questions.</p>
                    <div className="final-stats">
                        <div className="stat-box">
                            <div className="stat-label">Total Questions</div>
                            <div className="stat-value">{stats.reviewed}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Correct</div>
                            <div className="stat-value correct">
                                {stats.correct}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Accuracy</div>
                            <div className="stat-value">
                                {stats.reviewed > 0
                                    ? Math.round(
                                          (stats.correct / stats.reviewed) * 100
                                      )
                                    : 0}
                                %
                            </div>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleNextQuestion}
                    >
                        Review More Questions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-mode">
            <div className="quiz-header">
                <button className="btn btn-secondary back-btn" onClick={onBack}>
                    <FiArrowLeft /> Back
                </button>
                <div className="quiz-stats">
                    <span>
                        📊 Concept:{" "}
                        <strong>{currentQuestion.conceptTitle}</strong>
                    </span>
                    <span>
                        ✓ {stats.correct}/{stats.reviewed}
                    </span>
                </div>
            </div>

            <div className="quiz-container">
                <div className="question-card">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${
                                    sessionStats.questionsAnswered > 0
                                        ? (sessionStats.correct /
                                              sessionStats.questionsAnswered) *
                                          100
                                        : 0
                                }%`,
                            }}
                        ></div>
                    </div>

                    <div className="question-section">
                        <h2>Question {sessionStats.questionsAnswered + 1}</h2>
                        <div className="question-text">
                            {currentQuestion.question}
                        </div>
                    </div>

                    <div className="answer-section">
                        <label htmlFor="userAnswer">Your Answer:</label>
                        <textarea
                            id="userAnswer"
                            className="answer-input"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            disabled={showAnswer}
                            rows="4"
                        />
                    </div>

                    {!showAnswer && (
                        <div className="action-buttons">
                            <button
                                className="btn btn-success"
                                onClick={handleSubmitAnswer}
                                disabled={loading}
                            >
                                {loading ? "Evaluating..." : "Submit Answer"}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleSkip}
                                disabled={loading}
                            >
                                Skip Question
                            </button>
                        </div>
                    )}

                    {showAnswer && (
                        <div
                            className={`evaluation ${
                                evaluation.isCorrect ? "correct" : "incorrect"
                            }`}
                        >
                            <div className="evaluation-header">
                                {evaluation.isCorrect ? (
                                    <>
                                        <FiCheck className="icon correct" />
                                        <h3>Excellent!</h3>
                                    </>
                                ) : (
                                    <>
                                        <FiX className="icon incorrect" />
                                        <h3>Not quite right</h3>
                                    </>
                                )}
                            </div>

                            <div className="score-box">
                                <span className="score-label">Score</span>
                                <span
                                    className={`score-value ${
                                        evaluation.isCorrect
                                            ? "correct"
                                            : "incorrect"
                                    }`}
                                >
                                    {evaluation.score}%
                                </span>
                            </div>

                            <div className="feedback">
                                <p>
                                    <strong>Feedback:</strong>{" "}
                                    {evaluation.feedback}
                                </p>
                            </div>

                            <div className="answer-reveal">
                                <button
                                    className="btn-reveal"
                                    onClick={() => setShowAnswer(!showAnswer)}
                                >
                                    {showAnswer ? (
                                        <>
                                            <FiEyeOff /> Hide Expected Answer
                                        </>
                                    ) : (
                                        <>
                                            <FiEye /> Show Expected Answer
                                        </>
                                    )}
                                </button>

                                {showAnswer && (
                                    <div className="correct-answer">
                                        <h4>Expected Answer:</h4>
                                        <p>{evaluation.correctAnswer}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleNextQuestion}
                                disabled={loading}
                            >
                                Next Question →
                            </button>
                        </div>
                    )}
                </div>

                <div className="quiz-sidebar">
                    <div className="sidebar-section">
                        <h3>Session Progress</h3>
                        <div className="stat-item">
                            <span>Answered</span>
                            <strong>{sessionStats.questionsAnswered}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Correct</span>
                            <strong className="correct">
                                {sessionStats.correct}
                            </strong>
                        </div>
                        <div className="stat-item">
                            <span>Avg Score</span>
                            <strong>
                                {Math.round(sessionStats.avgScore)}%
                            </strong>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Tips for Success</h3>
                        <ul>
                            <li>Read questions carefully</li>
                            <li>Be specific with explanations</li>
                            <li>Use terminology from the course</li>
                            <li>Show your understanding</li>
                            <li>Review marked concepts again</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizMode;
