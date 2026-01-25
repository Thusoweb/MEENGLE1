/**
 * Analytics Service
 * Track user activity, conversions, and revenue
 */

import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

class AnalyticsService {
  /**
   * Track user event
   */
  async trackEvent(userId, eventType, eventData) {
    try {
      const eventsRef = collection(db, 'analyticsEvents');
      await addDoc(eventsRef, {
        userId,
        eventType, // 'signup', 'first_match', 'first_message', 'upgrade', 'payment', 'logout'
        eventData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(userId, page, duration) {
    await this.trackEvent(userId, 'page_view', { page, duration });
  }

  /**
   * Track conversion (signup to paid)
   */
  async trackConversion(userId, tier, amount) {
    await this.trackEvent(userId, 'conversion', {
      tier,
      amount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get daily active users
   */
  async getDailyActiveUsers(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const eventsRef = collection(db, 'analyticsEvents');
      const q = query(
        eventsRef,
        where('timestamp', '>=', startDate)
      );

      const snapshot = await getDocs(q);
      const uniqueUsers = new Set();

      snapshot.docs.forEach(doc => {
        uniqueUsers.add(doc.data().userId);
      });

      return uniqueUsers.size;
    } catch (error) {
      console.error('Error fetching DAU:', error);
      return 0;
    }
  }

  /**
   * Get conversion rate
   */
  async getConversionRate() {
    try {
      const eventsRef = collection(db, 'analyticsEvents');
      
      // Get total signups
      const signupQuery = query(eventsRef, where('eventType', '==', 'signup'));
      const signupSnapshot = await getDocs(signupQuery);
      const totalSignups = new Set(signupSnapshot.docs.map(d => d.data().userId)).size;

      // Get conversions
      const conversionQuery = query(eventsRef, where('eventType', '==', 'conversion'));
      const conversionSnapshot = await getDocs(conversionQuery);
      const totalConversions = new Set(conversionSnapshot.docs.map(d => d.data().userId)).size;

      return totalSignups > 0 ? (totalConversions / totalSignups * 100).toFixed(2) : 0;
    } catch (error) {
      console.error('Error calculating conversion rate:', error);
      return 0;
    }
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics() {
    try {
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);

      let totalRevenue = 0;
      let monthlyRevenue = 0;
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'completed') {
          totalRevenue += data.amount || 0;
          const paymentDate = data.timestamp?.toDate();
          if (paymentDate > monthAgo) {
            monthlyRevenue += data.amount || 0;
          }
        }
      });

      return {
        totalRevenue: (totalRevenue / 100).toFixed(2), // Convert from cents
        monthlyRevenue: (monthlyRevenue / 100).toFixed(2),
        paymentCount: snapshot.docs.length
      };
    } catch (error) {
      console.error('Error fetching revenue:', error);
      return { totalRevenue: 0, monthlyRevenue: 0, paymentCount: 0 };
    }
  }

  /**
   * Get tier distribution
   */
  async getTierDistribution() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const distribution = {
        free: 0,
        spark: 0,
        sparkplus: 0,
        flame: 0,
        wildfire: 0
      };

      snapshot.docs.forEach(doc => {
        const tier = doc.data().tier || 'free';
        distribution[tier] = (distribution[tier] || 0) + 1;
      });

      return distribution;
    } catch (error) {
      console.error('Error fetching tier distribution:', error);
      return {};
    }
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics() {
    try {
      const eventsRef = collection(db, 'analyticsEvents');

      // Get match count
      const matchQuery = query(eventsRef, where('eventType', '==', 'match'));
      const matchSnapshot = await getDocs(matchQuery);

      // Get message count
      const messageQuery = query(eventsRef, where('eventType', '==', 'message'));
      const messageSnapshot = await getDocs(messageQuery);

      // Get like count
      const likeQuery = query(eventsRef, where('eventType', '==', 'like'));
      const likeSnapshot = await getDocs(likeQuery);

      return {
        totalMatches: matchSnapshot.docs.length,
        totalMessages: messageSnapshot.docs.length,
        totalLikes: likeSnapshot.docs.length
      };
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      return { totalMatches: 0, totalMessages: 0, totalLikes: 0 };
    }
  }

  /**
   * Get churn rate
   */
  async getChurnRate() {
    try {
      const eventsRef = collection(db, 'analyticsEvents');
      
      // Get inactive users (no activity in 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(eventsRef, where('timestamp', '>=', thirtyDaysAgo));
      const snapshot = await getDocs(q);
      const activeUsers = new Set(snapshot.docs.map(d => d.data().userId));

      // Get total users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.docs.length;

      const churnedUsers = totalUsers - activeUsers.size;
      return ((churnedUsers / totalUsers) * 100).toFixed(2);
    } catch (error) {
      console.error('Error calculating churn:', error);
      return 0;
    }
  }
}

export default new AnalyticsService();
