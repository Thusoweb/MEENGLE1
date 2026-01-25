/**
 * Adults Only Settings Page
 * Age-gated content preferences for 18+ users
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adultContentService from '../services/adultContentService';
import './AdultSettingsPage.css';

const AdultSettingsPage = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [isAdult, setIsAdult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  useEffect(() => {
    verifyAndLoadPreferences();
  }, [user?.uid]);

  const verifyAndLoadPreferences = async () => {
    try {
      setLoading(true);
      
      // Verify user is 18+
      const adultStatus = await adultContentService.verifyAdultStatus(user.uid);
      setIsAdult(adultStatus);
      
      if (!adultStatus) {
        return; // Not 18+, can't access
      }
      
      // Load preferences
      const prefs = await adultContentService.getAdultPreferences(user.uid);
      setPreferences(prefs);
      setConsentAgreed(prefs.consentGiven || false);
    } catch (error) {
      console.error('Error loading adult preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = async () => {
    try {
      if (!consentAgreed) {
        alert('You must agree to the terms to enable adult content');
        return;
      }
      
      const updatedPrefs = {
        ...preferences,
        consentGiven: consentAgreed,
        consentDate: new Date().toISOString()
      };
      
      await adultContentService.updateAdultPreferences(user.uid, updatedPrefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  if (loading) {
    return <div className="adult-loading">Verifying age...</div>;
  }

  if (!isAdult) {
    return (
      <div className="adult-page adult-denied">
        <div className="denied-card">
          <h1>? Age Verification Required</h1>
          <p>This content is only available to users 18 years of age or older.</p>
          <p>Your account indicates you may not meet this requirement.</p>
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adult-page">
      <header className="adult-header">
        <h1>?? Adult Content Settings</h1>
        <p>18+ Content Preferences & Privacy Controls</p>
      </header>

      <div className="adult-container">
        {/* Warning */}
        <section className="adult-section warning">
          <h2>?? Important Notice</h2>
          <p>
            This section contains settings for adult-oriented content. 
            By enabling these options, you confirm that you are 18 years or older 
            and consent to viewing explicit content.
          </p>
        </section>

        {/* Consent */}
        <section className="adult-section consent">
          <h2>Consent & Agreement</h2>
          <div className="consent-box">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
              />
              <span>
                I am 18 years of age or older and consent to viewing adult content.
                I understand that this content may be explicit in nature and I choose 
                to enable it voluntarily.
              </span>
            </label>
          </div>
        </section>

        {/* Preferences */}
        {preferences && (
          <section className="adult-section preferences">
            <h2>Content Preferences</h2>
            
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.viewAdultContent}
                  onChange={() => handlePreferenceChange('viewAdultContent')}
                  disabled={!consentAgreed}
                />
                <span>View Adult Content Profiles</span>
                <p>See profiles from users who have enabled explicit content</p>
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.enableAdultContent}
                  onChange={() => handlePreferenceChange('enableAdultContent')}
                  disabled={!consentAgreed}
                />
                <span>Enable Adult Content on My Profile</span>
                <p>Allow others to see your explicit content if enabled</p>
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.explicitPhotos}
                  onChange={() => handlePreferenceChange('explicitPhotos')}
                  disabled={!preferences.enableAdultContent || !consentAgreed}
                />
                <span>Enable Explicit Photos</span>
                <p>Allow explicit or nude photos on your profile</p>
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.adultChat}
                  onChange={() => handlePreferenceChange('adultChat')}
                  disabled={!preferences.viewAdultContent || !consentAgreed}
                />
                <span>Allow Adult Conversations</span>
                <p>Enable explicit messaging with matched users</p>
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.nsfwFiltered}
                  onChange={() => handlePreferenceChange('nsfwFiltered')}
                />
                <span>Filter NSFW Content</span>
                <p>Automatically filter potentially explicit content in discovery</p>
              </label>
            </div>
          </section>
        )}

        {/* Safety */}
        <section className="adult-section safety">
          <h2>??? Safety & Privacy</h2>
          <ul>
            <li>? All adult content is encrypted end-to-end</li>
            <li>? Your preferences are private and not shared</li>
            <li>? You can report inappropriate content anytime</li>
            <li>? Block users from viewing your adult content</li>
            <li>? All activity is logged for compliance</li>
          </ul>
        </section>

        {/* Save Button */}
        <div className="adult-actions">
          <button 
            className="save-btn" 
            onClick={handleSavePreferences}
            disabled={!consentAgreed}
          >
            ?? Save Preferences
          </button>
          {saved && <span className="save-success">? Saved successfully</span>}
        </div>

        {/* Terms */}
        <section className="adult-section terms">
          <h2>Terms & Conditions</h2>
          <p>
            By enabling adult content features, you agree to:
          </p>
          <ul>
            <li>Respect the privacy and consent of other users</li>
            <li>Report any inappropriate behavior immediately</li>
            <li>Not share or download others' explicit content</li>
            <li>Comply with all local laws regarding adult content</li>
            <li>Accept responsibility for content you view</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdultSettingsPage;
