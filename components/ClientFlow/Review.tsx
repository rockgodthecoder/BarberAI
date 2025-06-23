import React from 'react';

type Props = {
  onBack: () => void;
};

const Review: React.FC<Props> = ({ onBack }) => (
  <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 mt-8 flex flex-col items-center">
    <h2 className="text-2xl font-bold mb-4 text-center">Step 5: Review & Submit</h2>
    <p className="mb-4 text-center">Review your selections here.</p>
    <div className="flex justify-between w-full gap-2">
      <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-1/2">Back</button>
      <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-1/2">Submit</button>
    </div>
  </div>
);

export default Review; 