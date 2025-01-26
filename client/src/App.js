import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [additionalAccomplishments, setAdditionalAccomplishments] = useState('');

  // GPT-4 outputs
  const [bulletPoints, setBulletPoints] = useState('');
  const [alignment, setAlignment] = useState('');
  const [misalignment, setMisalignment] = useState('');
  const [matchPercentage, setMatchPercentage] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Warn user if they refresh/close the page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Unsaved changes may be lost.';
      return 'Are you sure you want to leave? Unsaved changes may be lost.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Helper: copy text to clipboard (used only for final results)
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  // Upload & parse resume
  const handleUpload = async () => {
    if (!resumeFile) {
      alert('Please select a PDF resume first.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setResumeText('');
    setBulletPoints('');
    setAlignment('');
    setMisalignment('');
    setMatchPercentage('');

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

  // Generate GPT-4 summary
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
          <label htmlFor="resumeUpload" className="file-label">
            Resume (PDF)
          </label>
          <input
            id="resumeUpload"
            type="file"
            accept=".pdf"
            className="file-input"
            onChange={handleFileChange}
          />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Parse'}
          </button>
        </div>

        {/* 2) Editable Resume Text (NO copy button) */}
        {resumeText && (
          <div className="text-area-container form-group">
            <label>Resume Text (Editable)</label>
            {/* copy button removed */}
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
        )}

        {/* 3) Job Description (NO copy button) */}
        <div className="text-area-container form-group">
          <label>Job Description</label>
          {/* copy button removed */}
          <textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job details here..."
          />
        </div>

        {/* 4) Additional Accomplishments (NO copy button) */}
        <div className="text-area-container form-group">
          <label>Additional Accomplishments</label>
          {/* copy button removed */}
          <textarea
            rows={4}
            value={additionalAccomplishments}
            onChange={(e) => setAdditionalAccomplishments(e.target.value)}
            placeholder="List extra achievements you'd like considered..."
          />
        </div>

        {/* 5) Generate */}
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Processing...' : 'Generate Tailored Info'}
        </button>
      </div>

      {/* Error message */}
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {/* Tailored Bullet Points (copy button remains) */}
      {bulletPoints && (
        <div className="result-section">
          <h2>Tailored Bullet Points</h2>
          <div className="pre-wrapper">
            <button
              className="copy-button"
              onClick={() => copyToClipboard(bulletPoints)}
            >
              Copy
            </button>
            <pre className="resume-output">{bulletPoints}</pre>
          </div>
        </div>
      )}

      {/* Alignment / Misalignment / Match (copy buttons remain if desired) */}
      {(alignment || misalignment || matchPercentage) && (
        <div className="result-section">
          {alignment && (
            <div className="text-area-container">
              <h3>Aligned Areas</h3>
              <div className="pre-wrapper">
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(alignment)}
                >
                  Copy
                </button>
                <pre className="resume-output">{alignment}</pre>
              </div>
            </div>
          )}

          {misalignment && (
            <div className="text-area-container">
              <h3>Misaligned / Missing Areas</h3>
              <div className="pre-wrapper">
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(misalignment)}
                >
                  Copy
                </button>
                <pre className="resume-output">{misalignment}</pre>
              </div>
            </div>
          )}

          {matchPercentage && (
            <div className="text-area-container">
              <h3>Match Percentage</h3>
              <div className="pre-wrapper">
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(matchPercentage)}
                >
                  Copy
                </button>
                <pre className="resume-output">{matchPercentage}%</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
