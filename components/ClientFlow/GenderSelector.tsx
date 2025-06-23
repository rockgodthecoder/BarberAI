import React from 'react';

type Props = {
  onNext: (gender: 'male' | 'female') => void;
};

const GenderSelector: React.FC<Props> = ({ onNext }) => (
  <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 mt-8 flex flex-col items-center">
    <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Select Your Gender</h2>
    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
      <button
        className="w-full sm:w-40 px-6 py-4 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
        onClick={() => onNext('male')}
      >
        Male
      </button>
      <button
        className="w-full sm:w-40 px-6 py-4 bg-pink-500 text-white rounded-lg text-lg font-semibold hover:bg-pink-600 transition"
        onClick={() => onNext('female')}
      >
        Female
      </button>
    </div>
  </div>
);

export default GenderSelector; 