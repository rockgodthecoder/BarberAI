import React, { useRef, useState } from 'react';

type Props = {
  onNext: (aiAssumptions: any) => void;
  onImageUpload?: (base64: string) => void;
};

const PhotoUploader: React.FC<Props> = ({ onNext, onImageUpload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (onImageUpload) {
          onImageUpload(base64);
        }
        // Call the API
        const res = await fetch('/api/assumptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        if (res.ok) {
          onNext(data);
        } else {
          setError(data.error || 'Failed to analyze image');
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing image');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 mt-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-center">Step 1: Upload Your Photo</h2>
      <input
        type="file"
        accept="image/*"
        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={loading}
      />
      {loading && <div className="text-blue-600 mb-2">Analyzing image...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
    </div>
  );
};

export default PhotoUploader; 