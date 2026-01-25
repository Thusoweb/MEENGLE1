/**
 * Safety SOS Setup Component
 * UI for setting up emergency contacts
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import safetySOSService from '../services/safetySOSService';
import './SOSComponent.css';

const SOSComponent = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [sosEnabled, setSosEnabled] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [user?.uid]);

  const loadContacts = async () => {
    const savedContacts = await safetySOSService.getEmergencyContacts(user.uid);
    setContacts(savedContacts);
    setSosEnabled(savedContacts.length > 0);
  };

  const handleAddContact = async () => {
    if (!newContact.name || (!newContact.phoneNumber && !newContact.email)) {
      alert('Please enter contact name and phone or email');
      return;
    }

    try {
      setLoading(true);
      const updatedContacts = [...contacts, newContact];
      await safetySOSService.setEmergencyContacts(user.uid, updatedContacts);
      setContacts(updatedContacts);
      setNewContact({ name: '', phoneNumber: '', email: '' });
      setSosEnabled(true);
    } catch (error) {
      alert('Error adding contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = async (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    await safetySOSService.setEmergencyContacts(user.uid, updatedContacts);
    setContacts(updatedContacts);
  };

  const safetyTips = safetySOSService.getDateSafetyTips();

  return (
    <div className="sos-container">
      {/* Emergency Contacts Setup */}
      <div className="sos-card">
        <h3>?? Emergency Contacts</h3>
        <p>Set up trusted contacts who will be alerted if you activate SOS</p>

        <div className="contacts-form">
          <input
            type="text"
            placeholder="Contact name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={newContact.phoneNumber}
            onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email address"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          />
          <button 
            onClick={handleAddContact}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Contact'}
          </button>
        </div>

        {/* Current Contacts */}
        {contacts.length > 0 && (
          <div className="contacts-list">
            <h4>Your Emergency Contacts:</h4>
            {contacts.map((contact, idx) => (
              <div key={idx} className="contact-item">
                <div>
                  <p className="contact-name">{contact.name}</p>
                  {contact.phoneNumber && <p>{contact.phoneNumber}</p>}
                  {contact.email && <p>{contact.email}</p>}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveContact(idx)}
                >
                  ?
                </button>
              </div>
            ))}
          </div>
        )}

        {contacts.length === 0 && (
          <p className="warning">?? Add at least one emergency contact to enable SOS</p>
        )}
      </div>

      {/* SOS Button Demo */}
      {sosEnabled && (
        <div className="sos-button-demo">
          <h3>?? SOS Button</h3>
          <p>When activated, your emergency contacts will be notified with your location</p>
          <button className="sos-btn-demo" disabled>
            ?? SOS (Only active during dates)
          </button>
        </div>
      )}

      {/* Safety Tips */}
      <div className="safety-tips-card">
        <h3>?? Date Safety Tips</h3>
        <ul>
          {safetyTips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Location Sharing */}
      <div className="location-sharing-card">
        <h3>?? Real-time Location Sharing</h3>
        <p>Share your live location with a trusted friend during dates</p>
        <button className="share-btn">
          Enable Location Sharing
        </button>
        <p className="info">You control when to start/stop sharing</p>
      </div>
    </div>
  );
};

export default SOSComponent;
