import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // Existing states
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // NEW: Additional accomplishments
  const [additionalAccomplishments, setAdditionalAccomplishments] = useState('');

  // GPT-4 outputs
  const [bulletPoints, setBulletPoints] = useState('');
  const [alignment, setAlignment] = useState('');
  const [misalignment, setMisalignment] = useState('');
  const [matchPercentage, setMatchPercentage] = useState('');

  // Other states
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  // Upload PDF & parse resume
  const handleUpload = async () => {
    if (!resumeFile) {
      alert('Please select a PDF resume first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setBulletPoints('');
    setAlignment('');
    setMisalignment('');
    setMatchPercentage('');
    setResumeText('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const res = await axios.post('/api/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResumeText(res.data.resumeText);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error uploading or parsing resume.');
    } finally {
      setLoading(false);
    }
  };

  // Generate GPT-4 summary with bullet points, alignment, etc.
  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste the job description.');
      return;
    }
    if (!resumeText) {
      alert('No resume text found. Please upload your resume first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setBulletPoints('');
    setAlignment('');
    setMisalignment('');
    setMatchPercentage('');

    try {
      const res = await axios.post('/api/generate', {
        jobDescription,
        resumeText,
        additionalAccomplishments
      });
      const data = res.data;
      setBulletPoints(data.bulletPoints || '');
      setAlignment(data.alignment || '');
      setMisalignment(data.misalignment || '');
      setMatchPercentage(data.matchPercentage || '');
    } catch (err) {
      console.error(err);
      setErrorMsg('Error generating tailored info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Resume Tailor</h1>

      <div className="input-form">
        {/* 1) Upload Resume */}
        <div className="form-group">
          <label>Upload PDF Resume:</label>
          <input type="file" accept=".pdf" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Parse'}
          </button>
        </div>

        {/* Resume Text Preview */}
        {resumeText && (
          <div style={{ marginTop: '10px' }}>
            <strong>Extracted Resume Text (Preview):</strong>
            <pre>
              {resumeText.length > 500
                ? resumeText.substring(0, 500) + '...'
                : resumeText}
            </pre>
          </div>
        )}

                {/* NEW: Additional Accomplishments */}
                <div className="form-group">
          <label>Additional Accomplishments (not in resume):</label>
          <textarea
            rows={4}
            value={additionalAccomplishments}
            onChange={(e) => setAdditionalAccomplishments(e.target.value)}
            placeholder="List any extra achievements you'd like considered..."
          />
        </div>

        {/* 2) Job Description */}
        <div className="form-group">
          <label>Paste Job Description:</label>
          <textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job details here..."
          />
        </div>

        {/* 3) Generate */}
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Processing...' : 'Generate Tailored Info'}
        </button>
      </div>

      {/* Error message */}
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {/* Bullet Points */}
      {bulletPoints && (
        <div className="result-section">
          <h2>Tailored Bullet Points</h2>
          <pre className="resume-output">{bulletPoints}</pre>
        </div>
      )}

      {/* Alignment / Misalignment / Match */}
      {(alignment || misalignment || matchPercentage) && (
        <div className="result-section">
          <h2>Alignment & Match</h2>
          {alignment && (
            <>
              <h3>Aligned Areas</h3>
              <pre className="resume-output">{alignment}</pre>
            </>
          )}
          {misalignment && (
            <>
              <h3>Misaligned / Missing Areas</h3>
              <pre className="resume-output">{misalignment}</pre>
            </>
          )}
          {matchPercentage && (
            <h3>Match Percentage: {matchPercentage}%</h3>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
