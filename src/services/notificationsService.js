/**
 * Notifications Service
 * Push, email, and in-app notifications
 */

import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

class NotificationsService {
  /**
   * Create notification
   */
  async createNotification(userId, type, data) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const notificationDoc = await addDoc(notificationsRef, {
        userId,
        type, // 'match', 'message', 'like', 'verification', 'payment'
        title: this.getTitle(type, data),
        message: this.getMessage(type, data),
        data,
        read: false,
        createdAt: serverTimestamp(),
        actionUrl: this.getActionUrl(type, data)
      });

      // Send push notification if enabled
      await this.sendPushNotification(userId, type, data);
      
      return notificationDoc.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limit = 20) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId)
      );

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
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  /**
   * Get notification title
   */
  getTitle(type, data) {
    const titles = {
      match: 'New Match! ??',
      message: 'New Message ??',
      like: 'Someone Liked You ??',
      verification: 'Profile Verified ?',
      payment: 'Payment Received ??',
      referral: 'Referral Bonus ??',
      story: 'New Story ??'
    };
    return titles[type] || 'MEENGLE Notification';
  }

  /**
   * Get notification message
   */
  getMessage(type, data) {
    const messages = {
      match: `You matched with ${data.name || 'someone'}!`,
      message: `${data.senderName || 'Someone'} sent you a message`,
      like: `${data.likerName || 'Someone'} liked your profile`,
      verification: 'Your profile has been verified!',
      payment: `Payment of R${data.amount} successful`,
      referral: `You earned R${data.reward} from a referral!`,
      story: `${data.userName || 'Someone'} posted a new story`
    };
    return messages[type] || 'You have a new notification';
  }

  /**
   * Get action URL for notification
   */
  getActionUrl(type, data) {
    const urls = {
      match: `/discovery?match=${data.matchId}`,
      message: `/messages/${data.matchId}`,
      like: `/discovery?liked_by=${data.userId}`,
      verification: `/profile`,
      payment: `/payment/receipt/${data.paymentId}`,
      referral: `/rewards`,
      story: `/stories/${data.userId}`
    };
    return urls[type] || '/';
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId, type, data) {
    try {
      // Get user notification preferences
      const prefsRef = doc(db, 'notificationPreferences', userId);
      const prefsDoc = await getDoc(prefsRef);
      const prefs = prefsDoc.data();

      // Check if this type is enabled
      if (!prefs?.[`${type}Notifications`]) return;

      // Send to push service (Firebase Cloud Messaging)
      // This would be implemented on backend
      console.log(`Push notification sent: ${type}`, data);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(userId, email, type, data) {
    try {
      const emailRef = collection(db, 'emailQueue');
      await addDoc(emailRef, {
        userId,
        to: email,
        type,
        subject: this.getTitle(type, data),
        message: this.getMessage(type, data),
        data,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error queuing email:', error);
    }
  }

  /**
   * Set notification preferences
   */
  async setPreferences(userId, preferences) {
    try {
      const prefsRef = doc(db, 'notificationPreferences', userId);
      await setDoc(prefsRef, {
        userId,
        ...preferences,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error setting preferences:', error);
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId) {
    try {
      const prefsRef = doc(db, 'notificationPreferences', userId);
      const prefsDoc = await getDoc(prefsRef);

      return prefsDoc.exists() ? prefsDoc.data() : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Default notification preferences
   */
  getDefaultPreferences() {
    return {
      matchNotifications: true,
      messageNotifications: true,
      likeNotifications: true,
      pushNotifications: true,
      emailNotifications: true,
      dailyDigest: false,
      digestTime: '09:00'
    };
  }
}

export default new NotificationsService();
