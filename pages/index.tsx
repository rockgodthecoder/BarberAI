import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import fs from 'fs';
import path from 'path';

const PhotoUpload = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleContinue = () => {
    if (file && preview) {
      onUpload(preview); // Pass base64 preview to upload handler
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h1 className={styles.title}>Upload Your Photo</h1>
      <p className={styles.description}>
        Upload a clear, front-facing photo of yourself to get started.
      </p>
      <div className={styles.uploadBox}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {preview ? (
          <img src={preview} alt="Preview" className={styles.previewImage} />
        ) : (
          <div className={styles.uploadPlaceholder}>
            <span>+</span>
            <p>Click to select a file</p>
          </div>
        )}
      </div>
      {preview && (
        <button onClick={handleContinue} className={styles.uploadButton} disabled={loading}>
          {loading ? 'Analyzing...' : 'Upload and Continue'}
        </button>
      )}
    </div>
  );
};

const AssumptionsDisplay = ({ assumptions, onBack, onNext, uploadedImage, onAssumptionChange }) => {
  const [editingField, setEditingField] = useState(null);
  const assumptionsData = (typeof assumptions === 'object' && assumptions !== null) ? assumptions : {};
  const displayOrder = ['gender', 'faceShape', 'hairColor', 'hairType', 'hairLengthTop', 'hairLengthSides', 'hairLengthBack', 'description'];

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  };

  const getOptionsForField = (fieldName) => {
    const options = {
      gender: ['Male', 'Female'],
      faceShape: ['Oval', 'Round', 'Square', 'Heart', 'Diamond'],
      hairColor: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Mixed'],
      hairType: ['Straight', 'Wavy', 'Curly', 'Coily'],
      hairLengthTop: ['Short', 'Medium', 'Long'],
      hairLengthSides: ['Short', 'Medium', 'Long'],
      hairLengthBack: ['Short', 'Medium', 'Long'],
    };
    return options[fieldName] || [];
  };

  const handleEdit = (fieldName) => {
    setEditingField(fieldName);
  };

  const handleSave = () => {
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  return (
    <div className={styles.uploadContainer}>
      <h1 className={styles.title}>Review & Edit</h1>
      <p className={styles.description}>
        Please review and correct the AI's analysis.
      </p>
      {uploadedImage && <img src={uploadedImage} alt="Uploaded" className={styles.uploadedImagePreview} />}
      <div className={styles.assumptionsList}>
        {displayOrder.map(key => {
          const value = assumptionsData[key];
          if (value === undefined) return null;

          const isTextArea = key === 'description';
          const isEditing = editingField === key;
          const options = getOptionsForField(key);

          return (
            <div key={key} className={styles.assumptionItem}>
              <label htmlFor={key} className={styles.assumptionKey}>{toTitleCase(key)}:</label>
              <div className={styles.assumptionValueContainer}>
                {isEditing ? (
                  <div className={styles.editContainer}>
                    {isTextArea ? (
                      <textarea
                        id={key}
                        name={key}
                        value={value}
                        onChange={onAssumptionChange}
                        className={`${styles.assumptionInput} ${styles.assumptionTextarea}`}
                        rows={3}
                      />
                    ) : (
                      <select
                        id={key}
                        name={key}
                        value={value}
                        onChange={onAssumptionChange}
                        className={styles.assumptionSelect}
                      >
                        <option value="">Select {toTitleCase(key)}</option>
                        {options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className={styles.editButtons}>
                      <button onClick={handleSave} className={styles.saveButton}>Save</button>
                      <button onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.displayContainer}>
                    <span className={`${styles.assumptionValue} ${isTextArea ? styles.descriptionValue : ''}`}>{value}</span>
                    <button onClick={() => handleEdit(key)} className={styles.editButton}>
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={onBack} className={`${styles.uploadButton} ${styles.secondaryButton}`}>
          Back
        </button>
        <button onClick={onNext} className={styles.uploadButton}>
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

const HairstyleSelector = ({ assumptions, onBack, hairstyles, onFinalize }) => {
  const [selectedHairstyle, setSelectedHairstyle] = useState(null);

  const handleSelectHairstyle = (category, style) => {
    // A full identifier for the style
    const styleId = `${category}/${style}`;
    if (selectedHairstyle === styleId) {
      setSelectedHairstyle(null); // Allow deselecting
    } else {
      setSelectedHairstyle(styleId);
    }
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  };

  return (
    <div className={styles.uploadContainer}>
      <h1 className={styles.title}>Choose a Hairstyle</h1>
      <p className={styles.description}>
        Based on your selections, here are some recommended hairstyles.
      </p>

      {Object.keys(hairstyles).map(lengthCategory => (
        <div key={lengthCategory} className={styles.categorySection}>
          <h2 className={styles.hairstyleCategoryTitle}>{toTitleCase(lengthCategory)} Hairstyles</h2>
          <div className={styles.hairstyleGrid}>
            {hairstyles[lengthCategory].map(hairstyle => {
              const styleId = `${lengthCategory}/${hairstyle}`;
              const isSelected = selectedHairstyle === styleId;
              return (
                <div
                  key={hairstyle}
                  className={`${styles.hairstyleCard} ${isSelected ? styles.selectedHairstyle : ''}`}
                  onClick={() => handleSelectHairstyle(lengthCategory, hairstyle)}
                >
                  <img src={`/hairstyles/${lengthCategory}/${hairstyle}`} alt={hairstyle} className={styles.hairstyleImage} />
                  <p className={styles.hairstyleName}>{hairstyle.replace('.webp', '')}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className={styles.buttonGroup}>
        <button onClick={onBack} className={`${styles.uploadButton} ${styles.secondaryButton}`}>
          Back to Edit
        </button>
        <button
          onClick={() => onFinalize(selectedHairstyle)}
          className={styles.uploadButton}
          disabled={!selectedHairstyle}
        >
          Finalize Selection
        </button>
      </div>
    </div>
  );
};

const ResultPage = ({ uploadedImage, finalSelection, onStartOver, assumptions, onFeedbackSubmit }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 2500); // Simulate generation time
    return () => clearTimeout(timer);
  }, []);

  const selectedStyleName = finalSelection ? finalSelection.split('/')[1].replace('.webp', '') : 'your new';

  return (
    <div className={`${styles.uploadContainer} ${styles.resultPage}`}>
      <h1 className={styles.title}>Your New Look</h1>
      <p className={styles.description}>
        Here's a preview of you with the "{selectedStyleName}" style.
      </p>

      <div className={styles.resultGrid}>
        <div className={styles.resultRow}>
          <div className={styles.resultCard}>
            <h3 className={styles.resultTitle}>your photo</h3>
            <img src={uploadedImage} alt="Original" className={styles.resultImage} />
          </div>
          <div className={styles.resultCard}>
            <h3 className={styles.resultTitle}>selected style</h3>
            <img src={`/hairstyles/${finalSelection}`} alt="Selected Hairstyle" className={styles.resultImage} />
          </div>
        </div>
        <div className={`${styles.resultCard} ${styles.resultCardHighlight}`} style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <h3 className={styles.resultTitle}>AI-Generated Result</h3>
          {isGenerating ? (
            <div className={styles.generatingPlaceholder}>
              <div className={styles.spinner}></div>
              <p>Generating...</p>
            </div>
          ) : (
            <>
              <img src={uploadedImage} alt="Generated Hairstyle" className={styles.resultImageLarge} />
              <div className={styles.chatBox}>
                <h3 className={styles.chatBoxTitle}>Tell us about your result</h3>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    onFeedbackSubmit({ likes, dislikes });
                  }}
                >
                  <div className={styles.chatBoxField}>
                    <label htmlFor="likes">What do you like about it?</label>
                    <textarea
                      id="likes"
                      value={likes}
                      onChange={e => setLikes(e.target.value)}
                      className={styles.chatBoxTextarea}
                      rows={2}
                      placeholder="I like..."
                    />
                  </div>
                  <div className={styles.chatBoxField}>
                    <label htmlFor="dislikes">What don't you like about it?</label>
                    <textarea
                      id="dislikes"
                      value={dislikes}
                      onChange={e => setDislikes(e.target.value)}
                      className={styles.chatBoxTextarea}
                      rows={2}
                      placeholder="I don't like..."
                    />
                  </div>
                  <button type="submit" className={styles.uploadButton} style={{ marginTop: '1rem' }}>
                    Submit Feedback
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryPage = ({ uploadedImage, finalSelection, assumptions, feedback, onStartOver }) => {
  const selectedStyleName = finalSelection ? finalSelection.split('/')[1].replace('.webp', '') : 'your new';
  return (
    <div className={`${styles.uploadContainer} ${styles.resultPage}`}>
      <h1 className={styles.title}>Summary</h1>
      <p className={styles.description}>Here is a summary of your session:</p>
      <div className={styles.resultGrid}>
        <div className={styles.resultRow}>
          <div className={styles.resultCard}>
            <h3 className={styles.resultTitle}>Your Photo</h3>
            <img src={uploadedImage} alt="Original" className={styles.resultImage} />
          </div>
          <div className={styles.resultCard}>
            <h3 className={styles.resultTitle}>Selected Style</h3>
            <img src={`/hairstyles/${finalSelection}`} alt="Selected Hairstyle" className={styles.resultImage} />
            <div style={{marginTop: '1rem', fontWeight: 500, textAlign: 'center'}}>{selectedStyleName}</div>
          </div>
        </div>
        <div className={styles.resultCard} style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <h3 className={styles.resultTitle}>AI Assumptions</h3>
          <ul style={{textAlign: 'left', margin: 0, padding: 0, listStyle: 'none'}}>
            {assumptions && Object.entries(assumptions).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {value}</li>
            ))}
          </ul>
        </div>
        <div className={styles.resultCard} style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <h3 className={styles.resultTitle}>Your Feedback</h3>
          <div><strong>Likes:</strong> {feedback.likes}</div>
          <div><strong>Dislikes:</strong> {feedback.dislikes}</div>
        </div>
      </div>
      <button onClick={onStartOver} className={styles.uploadButton} style={{marginTop: '2rem'}}>Start Over</button>
    </div>
  );
};

const IndexPage = ({ hairstyles }) => {
  const [loading, setLoading] = useState(false);
  const [assumptions, setAssumptions] = useState(null);
  const [view, setView] = useState('upload'); // 'upload', 'assumptions', 'hairstyles', 'result', 'summary'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [finalSelection, setFinalSelection] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handlePhotoUpload = async (imageBase64) => {
    setLoading(true);
    setUploadedImage(imageBase64);
    try {
      const response = await fetch('/api/assumptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await response.json();

      if (response.ok) {
        setAssumptions(data);
        setView('assumptions');
      } else {
        throw new Error(data.raw || data.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Error fetching assumptions:', error);
      alert(`Failed to get assumptions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssumptionChange = (e) => {
    const { name, value } = e.target;
    setAssumptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBack = () => {
    if (view === 'hairstyles') {
      setView('assumptions');
    } else {
      setView('upload');
      setAssumptions(null);
      setUploadedImage(null);
    }
  };

  const handleNext = () => {
    if (view === 'assumptions') {
      setView('hairstyles');
      console.log("Confirmed Assumptions:", assumptions);
    }
  };

  const handleFinalize = (hairstyle) => {
    console.log("Placeholder script: Generating haircut with style:", hairstyle);
    setFinalSelection(hairstyle);
    setView('result');
  };

  const handleStartOver = () => {
    setLoading(false);
    setAssumptions(null);
    setView('upload');
    setUploadedImage(null);
    setFinalSelection(null);
    setFeedback(null);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {view === 'upload' && <PhotoUpload onUpload={handlePhotoUpload} loading={loading} />}
        {view === 'assumptions' && (
          <AssumptionsDisplay
            assumptions={assumptions}
            onBack={handleBack}
            onNext={handleNext}
            uploadedImage={uploadedImage}
            onAssumptionChange={handleAssumptionChange}
          />
        )}
        {view === 'hairstyles' && (
          <HairstyleSelector
            assumptions={assumptions}
            onBack={handleBack}
            hairstyles={hairstyles}
            onFinalize={handleFinalize}
          />
        )}
        {view === 'result' && (
          <ResultPage
            uploadedImage={uploadedImage}
            finalSelection={finalSelection}
            onStartOver={handleStartOver}
            assumptions={assumptions}
            onFeedbackSubmit={async (fb) => {
              setFeedback(fb);
              try {
                await fetch('/api/sendSummaryEmail', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    uploadedImage,
                    finalSelection,
                    assumptions,
                    feedback: fb,
                  }),
                });
              } catch (err) {
                alert('Failed to send summary email.');
              }
              setView('summary');
            }}
          />
        )}
        {view === 'summary' && (
          <SummaryPage
            uploadedImage={uploadedImage}
            finalSelection={finalSelection}
            assumptions={assumptions}
            feedback={feedback}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  );
};

export async function getStaticProps() {
  const hairstylesRootDir = path.join(process.cwd(), 'public/hairstyles');
  const allHairstyles = {};

  try {
    const lengthDirs = fs.readdirSync(hairstylesRootDir).filter(entry => {
      const entryPath = path.join(hairstylesRootDir, entry);
      // Make sure it's a directory and not a file like .DS_Store
      return fs.statSync(entryPath).isDirectory();
    });

    for (const lengthDir of lengthDirs) {
      const dirPath = path.join(hairstylesRootDir, lengthDir);
      const filenames = fs.readdirSync(dirPath);
      allHairstyles[lengthDir] = filenames.filter(filename => filename.endsWith('.webp'));
    }
  } catch (error) {
    console.error("Could not read hairstyle directories:", error);
  }

  return {
    props: {
      hairstyles: allHairstyles,
    },
  };
}

export default IndexPage;
