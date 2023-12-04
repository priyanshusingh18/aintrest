"use client";
import React, { useState } from "react";

const QuizApp = () => {
  const questions = [
    {
      question: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correctAnswer: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      correctAnswer: "Mars",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const handleOptionChange = (e) => {
    if (selectedOption) return alert("You can't change the answer now.");
    setSelectedOption(e.target.value);
  };

  const handleNextQuestion = () => {
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setSelectedOption(null);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  return (
    <div className="quiz-container">
      <div className="question">
        <p>{questions[currentQuestion].question}</p>
      </div>
      <div className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <div key={index} className="option">
            <input
              type="radio"
              id={`option${index + 1}`}
              name="answer"
              value={option}
              checked={selectedOption === option}
              onChange={handleOptionChange}
            />
            <label htmlFor={`option${index + 1}`}>{option}</label>
          </div>
        ))}
      </div>
      <div className="feedback">
        {selectedOption !== null && (
          <p>
            {selectedOption === questions[currentQuestion].correctAnswer
              ? "Correct!"
              : "Incorrect!"}
          </p>
        )}
      </div>
      <div className="button-container">
        {currentQuestion + 1 < questions.length ? (
          <button onClick={handleNextQuestion}>Next</button>
        ) : (
          <p>{`Quiz Complete! You scored ${score} out of ${questions.length}!`}</p>
        )}
      </div>
    </div>
  );
};

export default QuizApp;
