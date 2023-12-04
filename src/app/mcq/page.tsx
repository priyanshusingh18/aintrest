// YourPage.tsx (or any other Next.js page or component)

import React from "react";
import MCQPage, { MCQ } from "../../components/MCQPage"; // Adjust the import path as needed

const YourPage: React.FC = () => {
  const mcqs: MCQ[] = [
    {
      question: "What is 2 + 2?",
      options: [
        { text: "3", value: "3" },
        { text: "4", value: "4" },
        { text: "5", value: "5" },
        { text: "6", value: "6" },
      ],
    },
    {
      question: "What is the capital of France?",
      options: [
        { text: "Berlin", value: "Berlin" },
        { text: "Madrid", value: "Madrid" },
        { text: "Paris", value: "Paris" },
        { text: "Rome", value: "Rome" },
      ],
    },
    // Add more MCQs as needed
  ];

  return (
    <div>
      <MCQPage mcqs={mcqs} />
    </div>
  );
};

export default YourPage;
