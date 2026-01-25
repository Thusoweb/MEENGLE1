/**
 * Photo Verification Component
 * UI for submitting verification photos
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import photoVerificationService from '../services/photoVerificationService';
import './PhotoVerificationComponent.css';

const PhotoVerificationComponent = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    loadVerificationStatus();
  }, [user?.uid]);

  const loadVerificationStatus = async () => {
    const status = await photoVerificationService.getVerificationStatus(user.uid);
    setVerificationStatus(status);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a photo');
      return;
    }

    try {
      setLoading(true);
      const result = await photoVerificationService.submitPhotoForVerification(user.uid, selectedFile);
      setStatus('submitted');
      setSelectedFile(null);
      setPreview(null);
      setVerificationStatus(result);
    } catch (error) {
      alert('Error submitting photo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationStatus?.approved) {
    return (
      <div className="verification-card approved">
        <div className="verified-icon">?</div>
        <h3>Profile Verified</h3>
        <p>Your photo has been verified. You now have the verified badge!</p>
      </div>
    );
  }

  if (verificationStatus?.status === 'pending') {
    return (
      <div className="verification-card pending">
        <div className="pending-icon">?</div>
        <h3>Verification Pending</h3>
        <p>Your photo is being reviewed. This usually takes 1-2 hours.</p>
      </div>
    );
  }

  if (verificationStatus?.status === 'rejected') {
    return (
      <div className="verification-card rejected">
        <div className="rejected-icon">?</div>
        <h3>Verification Rejected</h3>
        <p>{verificationStatus.notes || 'Please try again with a different photo.'}</p>
        <button onClick={() => document.getElementById('fileInput').click()}>
          Resubmit Photo
        </button>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h3>?? Verify Your Profile</h3>
        <p>Get the verified badge and build trust with other users.</p>
        
        <div className="verification-requirements">
          <h4>Requirements:</h4>
          <ul>
            <li>? Clear, recent photo of your face</li>
            <li>? Good lighting</li>
            <li>? No filters or heavy editing</li>
            <li>? Face fully visible</li>
          </ul>
        </div>

        <div className="file-upload">
          {preview ? (
            <div className="preview">
              <img src={preview} alt="Preview" />
              <button onClick={() => { setPreview(null); setSelectedFile(null); }}>
                Choose Different Photo
              </button>
            </div>
          ) : (
            <label className="upload-label">
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="upload-box">
                <div className="upload-icon">??</div>
                <p>Click to upload photo</p>
                <small>or drag and drop</small>
              </div>
            </label>
          )}
        </div>

        {preview && (
          <button 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        )}

        {status === 'submitted' && (
          <div className="success-message">
            ? Photo submitted! Check back in 1-2 hours.
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoVerificationComponent;
