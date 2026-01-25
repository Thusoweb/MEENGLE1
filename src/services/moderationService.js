/**
 * Admin Moderation Service
 * Manage reports, verify photos, ban users
 */

import { db } from '../config/firebase';
import { doc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

class ModerationService {
  /**
   * Get pending verifications
   */
  async getPendingVerifications(limit = 10) {
    try {
      const verificationsRef = collection(db, 'photoVerifications');
      const q = query(verificationsRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate()
        }))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return [];
    }
  }

  /**
   * Get all reports
   */
  async getReports(status = 'pending', limit = 20) {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, where('status', '==', status));
      const snapshot = await getDocs(q);

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  /**
   * Ban user
   */
  async banUser(userId, reason, duration = null) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        banned: true,
        banReason: reason,
        bannedAt: serverTimestamp(),
        banExpires: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
      });

      // Log moderation action
      await this.logModerationAction(userId, 'ban', reason);

      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  /**
   * Unban user
   */
  async unbanUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        banned: false,
        banReason: null,
        bannedAt: null
      });

      await this.logModerationAction(userId, 'unban', 'User unbanned');

      return true;
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  /**
   * Flag content for review
   */
  async flagContent(contentId, contentType, reason) {
    try {
      const flagRef = collection(db, 'contentFlags');
      await addDoc(flagRef, {
        contentId,
        contentType, // 'photo', 'profile', 'message', 'story'
        reason,
        flagged: true,
        status: 'pending',
        flaggedAt: serverTimestamp(),
        resolvedAt: null
      });

      return true;
    } catch (error) {
      console.error('Error flagging content:', error);
      throw error;
    }
  }

  /**
   * Resolve report
   */
  async resolveReport(reportId, action, notes) {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: 'resolved',
        action, // 'dismiss', 'warn', 'ban'
        notes,
        resolvedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  }

  /**
   * Send warning to user
   */
  async sendWarning(userId, reason) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const warnings = (userDoc.data()?.warnings || []) + 1;

      await updateDoc(userRef, {
        warnings,
        lastWarning: serverTimestamp(),
        lastWarningReason: reason
      });

      // Auto-ban if 3+ warnings
      if (warnings >= 3) {
        await this.banUser(userId, 'Exceeded warning limit');
      }

      await this.logModerationAction(userId, 'warning', reason);

      return warnings;
    } catch (error) {
      console.error('Error sending warning:', error);
      throw error;
    }
  }

  /**
   * Get user moderation history
   */
  async getUserModerationHistory(userId) {
    try {
      const logsRef = collection(db, 'moderationLogs');
      const q = query(logsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching moderation history:', error);
      return [];
    }
  }

  /**
   * Log moderation action
   */
  async logModerationAction(userId, action, reason) {
    try {
      const logsRef = collection(db, 'moderationLogs');
      await addDoc(logsRef, {
        userId,
        action, // 'ban', 'unban', 'warning', 'verification', 'flag'
        reason,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  /**
   * Get moderation stats
   */
  async getModerationStats() {
    try {
      const reportsRef = collection(db, 'reports');
      const allReportsSnapshot = await getDocs(reportsRef);
      
      const pendingQuery = query(reportsRef, where('status', '==', 'pending'));
      const pendingSnapshot = await getDocs(pendingQuery);

      const bannedUsersRef = collection(db, 'users');
      const bannedQuery = query(bannedUsersRef, where('banned', '==', true));
      const bannedSnapshot = await getDocs(bannedQuery);

      return {
        totalReports: allReportsSnapshot.docs.length,
        pendingReports: pendingSnapshot.docs.length,
        bannedUsers: bannedSnapshot.docs.length
      };
    } catch (error) {
      console.error('Error fetching moderation stats:', error);
      return { totalReports: 0, pendingReports: 0, bannedUsers: 0 };
    }
  }
}

export default new ModerationService();
