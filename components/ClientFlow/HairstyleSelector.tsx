import React, { useState } from 'react';

interface Hairstyle {
  name: string;
  length: 'short' | 'medium' | 'long';
  imageUrl: string;
}

type Props = {
  hairstyles: Hairstyle[];
  onNext: (hairstyle: string) => void;
  onBack: () => void;
};

const HairstyleSelector: React.FC<Props> = ({ hairstyles, onNext, onBack }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const groupedHairstyles = hairstyles.reduce((acc, style) => {
    if (!acc[style.length]) {
      acc[style.length] = [];
    }
    acc[style.length].push(style);
    return acc;
  }, {} as Record<'short' | 'medium' | 'long', Hairstyle[]>);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 mt-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-center">Step 3: Select a Hairstyle</h2>
      
      {Object.entries(groupedHairstyles).map(([length, styles]) => (
        <div key={length} className="w-full mb-8">
          <h3 className="text-xl font-semibold mb-4 capitalize">{length} Hairstyles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {styles.map(style => (
              <div
                key={style.name}
                className={`border rounded p-2 cursor-pointer hover:bg-blue-50 text-center ${selected === style.name ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                onClick={() => setSelected(style.name)}
              >
                <img src={style.imageUrl} alt={style.name} className="w-full h-32 object-cover rounded mb-2" />
                <p>{style.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between w-full gap-2 mt-4">
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-1/2">Back</button>
        <button
          onClick={() => selected && onNext(selected)}
          className={`px-4 py-2 text-white rounded w-1/2 ${selected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!selected}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HairstyleSelector; 