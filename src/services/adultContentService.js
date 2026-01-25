/**
 * Adults Only Content Filter & Verification Service
 * Age-gated content for 18+ features
 * GDPR & Privacy compliant
 */

import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

class AdultsOnlyService {
  /**
   * Verify user is 18+
   */
  async verifyAdultStatus(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      const age = this.calculateAge(userData.dateOfBirth);
      
      return age >= 18;
    } catch (error) {
      console.error('Error verifying adult status:', error);
      return false;
    }
  }

  /**
   * Get adult content preferences
   */
  async getAdultPreferences(userId) {
    try {
      const prefsRef = doc(db, 'adultPreferences', userId);
      const prefsDoc = await getDoc(prefsRef);
      
      return prefsDoc.exists() ? prefsDoc.data() : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error fetching adult preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update adult content preferences
   */
  async updateAdultPreferences(userId, preferences) {
    try {
      const prefsRef = doc(db, 'adultPreferences', userId);
      await setDoc(prefsRef, {
        ...preferences,
        updatedAt: serverTimestamp(),
        userId
      }, { merge: true });
      
      // Log for compliance
      await this.logAdultContentConsent(userId, preferences);
      
      return true;
    } catch (error) {
      console.error('Error updating adult preferences:', error);
      throw error;
    }
  }

  /**
   * Check if profile should show adult content
   */
  async canViewAdultContent(viewerUserId, profileUserId) {
    try {
      // Both users must be 18+
      const viewerIs18 = await this.verifyAdultStatus(viewerUserId);
      const profileIs18 = await this.verifyAdultStatus(profileUserId);
      
      if (!viewerIs18 || !profileIs18) return false;
      
      // Viewer must have enabled adult content viewing
      const viewerPrefs = await this.getAdultPreferences(viewerUserId);
      if (!viewerPrefs.viewAdultContent) return false;
      
      // Profile owner must have enabled adult content
      const profilePrefs = await this.getAdultPreferences(profileUserId);
      if (!profilePrefs.enableAdultContent) return false;
      
      return true;
    } catch (error) {
      console.error('Error checking adult content access:', error);
      return false;
    }
  }

  /**
   * Filter profiles based on adult content preferences
   */
  async filterAdultProfiles(profiles, userPreferences) {
    return profiles.filter(profile => {
      // If user disabled adult content, filter out profiles with it
      if (!userPreferences.viewAdultContent && profile.adultContent) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get default adult preferences
   */
  getDefaultPreferences() {
    return {
      enableAdultContent: false,
      viewAdultContent: false,
      explicitPhotos: false,
      adultChat: false,
      nsfwFiltered: true,
      consentGiven: false,
      consentDate: null
    };
  }

  /**
   * Verify age from DOB
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Log adult content consent for compliance
   */
  async logAdultContentConsent(userId, preferences) {
    try {
      const logRef = doc(db, 'adultContentLogs', `${userId}_${Date.now()}`);
      await setDoc(logRef, {
        userId,
        action: 'consent_update',
        preferences,
        timestamp: serverTimestamp(),
        ipHash: await this.getIpHash(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging consent:', error);
    }
  }

  /**
   * Hash IP for privacy
   */
  async getIpHash() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return this.hashString(data.ip);
    } catch {
      return 'unknown';
    }
  }

  /**
   * Simple hash function
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Get adult profiles for discovery
   */
  async getAdultProfiles(userPreferences, location, distance = 50) {
    try {
      // Only return profiles if user enabled adult content viewing
      if (!userPreferences.viewAdultContent) {
        return [];
      }
      
      // Query profiles with adultContent = true
      // Filtered by location and distance
      // Both users must be 18+
      
      return []; // Implement with Firestore query
    } catch (error) {
      console.error('Error fetching adult profiles:', error);
      return [];
    }
  }

  /**
   * Report inappropriate adult content
   */
  async reportAdultContent(reporterId, reportedUserId, reason) {
    try {
      const reportRef = doc(db, 'adultContentReports', `${reportedUserId}_${Date.now()}`);
      await setDoc(reportRef, {
        reporterId,
        reportedUserId,
        reason,
        timestamp: serverTimestamp(),
        status: 'pending',
        reviewed: false
      });
      
      return true;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  /**
   * Block adult content from user
   */
  async blockAdultUser(userId, blockedUserId) {
    try {
      const blockRef = doc(db, 'adultContentBlocks', `${userId}_${blockedUserId}`);
      await setDoc(blockRef, {
        userId,
        blockedUserId,
        timestamp: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }
}

export default new AdultsOnlyService();
