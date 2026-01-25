/**
 * Safety SOS Service
 * Emergency button - alerts trusted contacts
 */

import { db } from '../config/firebase';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

class SafetySosService {
  /**
   * Set emergency contacts
   */
  async setEmergencyContacts(userId, contacts) {
    try {
      const sosRef = doc(db, 'safetySettings', userId);
      await setDoc(sosRef, {
        userId,
        emergencyContacts: contacts,
        updatedAt: serverTimestamp(),
        sosEnabled: true
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error setting emergency contacts:', error);
      throw error;
    }
  }

  /**
   * Get emergency contacts
   */
  async getEmergencyContacts(userId) {
    try {
      const sosRef = doc(db, 'safetySettings', userId);
      const sosDoc = await getDoc(sosRef);
      
      return sosDoc.exists() ? sosDoc.data().emergencyContacts || [] : [];
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }
  }

  /**
   * Trigger SOS - alert emergency contacts with location
   */
  async triggerSos(userId, currentLocation) {
    try {
      // Create SOS alert record
      const sosRef = collection(db, 'sosAlerts');
      const alertDoc = await addDoc(sosRef, {
        userId,
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: currentLocation.address
        },
        timestamp: serverTimestamp(),
        status: 'active',
        respondedBy: []
      });
      
      // Get emergency contacts
      const contacts = await this.getEmergencyContacts(userId);
      
      // Send notifications to contacts
      for (const contact of contacts) {
        await this.sendSosAlert(userId, contact, currentLocation);
      }
      
      // Log SOS event
      await this.logSosEvent(userId, currentLocation);
      
      return alertDoc.id;
    } catch (error) {
      console.error('Error triggering SOS:', error);
      throw error;
    }
  }

  /**
   * Send alert to emergency contact
   */
  async sendSosAlert(userId, contact, location) {
    try {
      const alertRef = collection(db, 'notifications');
      await addDoc(alertRef, {
        recipientId: contact.phoneNumber || contact.email,
        senderUserId: userId,
        type: 'sos_alert',
        message: `${userId} has activated their SOS button. Location: ${location.address}`,
        location: location,
        timestamp: serverTimestamp(),
        read: false,
        urgent: true
      });
    } catch (error) {
      console.error('Error sending SOS alert:', error);
    }
  }

  /**
   * Disable SOS (when safe)
   */
  async disableSos(alertId) {
    try {
      const alertRef = doc(db, 'sosAlerts', alertId);
      await updateDoc(alertRef, {
        status: 'disabled',
        disabledAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error disabling SOS:', error);
      throw error;
    }
  }

  /**
   * Confirm SOS response
   */
  async confirmSosResponse(alertId, responderId) {
    try {
      const alertRef = doc(db, 'sosAlerts', alertId);
      await updateDoc(alertRef, {
        respondedBy: [responderId],
        respondedAt: serverTimestamp(),
        status: 'responded'
      });
      
      return true;
    } catch (error) {
      console.error('Error confirming response:', error);
      throw error;
    }
  }

  /**
   * Get SOS history
   */
  async getSosHistory(userId, limit = 10) {
    try {
      // Query SOS alerts for user
      // Return last N alerts
      return [];
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      return [];
    }
  }

  /**
   * Log SOS event for analytics
   */
  async logSosEvent(userId, location) {
    try {
      const logRef = collection(db, 'sosLogs');
      await addDoc(logRef, {
        userId,
        location,
        timestamp: serverTimestamp(),
        type: 'sos_triggered'
      });
    } catch (error) {
      console.error('Error logging SOS event:', error);
    }
  }

  /**
   * Enable location sharing during date
   */
  async enableDateLocationShare(userId, matchId, durationMinutes = 120) {
    try {
      const shareRef = doc(db, 'dateLocationShares', `${userId}_${matchId}`);
      await setDoc(shareRef, {
        userId,
        matchId,
        startTime: serverTimestamp(),
        endTime: new Date(Date.now() + durationMinutes * 60 * 1000),
        active: true
      });
      
      return true;
    } catch (error) {
      console.error('Error enabling location share:', error);
      throw error;
    }
  }

  /**
   * Get date safety tips
   */
  getDateSafetyTips() {
    return [
      '? Tell a friend where you\'re going',
      '? Share your location with emergency contacts',
      '? Meet in public place first',
      '? Have your own transportation',
      '? Keep your phone charged',
      '? Trust your gut feeling',
      '? Don\'t give out personal details early',
      '? Have an exit plan if uncomfortable',
      '? Use the SOS button if needed',
      '? Check in with a friend during the date'
    ];
  }

  /**
   * Get safety resources
   */
  getSafetyResources() {
    return {
      hotlines: {
        nationalDomesticViolence: '1-800-799-7233',
        criminalJustice: '1-855-4-VICTIM'
      },
      tips: this.getDateSafetyTips(),
      reporting: 'Use the report feature to flag unsafe behavior'
    };
  }
}

export default new SafetySosService();
