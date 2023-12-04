// MCQPage.tsx

import React from "react";

interface MCQOption {
  text: string;
  value: string;
}

export interface MCQ {
  question: string;
  options: MCQOption[];
}

interface MCQPageProps {
  mcqs: MCQ[];
}

const MCQPage: React.FC<MCQPageProps> = ({ mcqs }) => {
  return (
    <div className="min-h-full bg-zinc-50 flex flex-col items-center justify-center gap-8 p-4">
      {mcqs.map((mcq, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-md w-96">
          <h3 className="font-semibold text-xl">{mcq.question}</h3>
          {mcq.options.map((option, optionIndex) => (
            <div key={optionIndex} className="mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`mcq_${index}`}
                  value={option.value}
                  className="mr-2"
                />
                {option.text}
              </label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MCQPage;
