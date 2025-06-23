import React from 'react';

type Props = {
  onNext: () => void;
  onBack: () => void;
};

const Questionnaire: React.FC<Props> = ({ onNext, onBack }) => (
  <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 mt-8 flex flex-col items-center">
    <h2 className="text-2xl font-bold mb-4 text-center">Step 4: Questionnaire</h2>
    <label className="block mb-2 w-full">
      <span className="text-gray-700">What is your hair type?</span>
      <input type="text" className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
    </label>
    <label className="block mb-4 w-full">
      <span className="text-gray-700">Any allergies?</span>
      <input type="text" className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
    </label>
    <div className="flex justify-between w-full gap-2">
      <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-1/2">Back</button>
      <button onClick={onNext} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-1/2">Next</button>
    </div>
  </div>
);

export default Questionnaire; 