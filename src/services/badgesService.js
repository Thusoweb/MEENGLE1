/**
 * Badges & Verification System
 * Trust badges for verified users
 */

import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

class BadgesService {
  constructor() {
    this.availableBadges = {
      verified: {
        icon: '?',
        label: 'Photo Verified',
        description: 'Profile photo has been verified',
        color: '#4caf50'
      },
      active: {
        icon: '?',
        label: 'Active Now',
        description: 'User is currently online',
        color: '#4caf50'
      },
      popular: {
        icon: '?',
        label: 'Popular',
        description: 'Frequently liked by others',
        color: '#ffb300'
      },
      responsive: {
        icon: '??',
        label: 'Responsive',
        description: 'Replies quickly to messages',
        color: '#2196f3'
      },
      safety: {
        icon: '???',
        label: 'Safety Conscious',
        description: 'Has set up emergency contacts',
        color: '#4caf50'
      },
      premium: {
        icon: '??',
        label: 'Premium Member',
        description: 'Active subscription member',
        color: '#ffb300'
      },
      featured: {
        icon: '?',
        label: 'Featured',
        description: 'Profile featured this week',
        color: '#ffb300'
      },
      newMember: {
        icon: '?',
        label: 'New Member',
        description: 'Joined recently',
        color: '#2196f3'
      },
      trustedUser: {
        icon: '??',
        label: 'Trusted User',
        description: '100+ positive interactions',
        color: '#4caf50'
      }
    };
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId, badgeKey) {
    try {
      if (!this.availableBadges[badgeKey]) {
        throw new Error('Invalid badge');
      }
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentBadges = userDoc.data()?.badges || [];
      
      if (!currentBadges.includes(badgeKey)) {
        await updateDoc(userRef, {
          badges: [...currentBadges, badgeKey]
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  /**
   * Remove badge from user
   */
  async removeBadge(userId, badgeKey) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentBadges = userDoc.data()?.badges || [];
      
      await updateDoc(userRef, {
        badges: currentBadges.filter(b => b !== badgeKey)
      });
      
      return true;
    } catch (error) {
      console.error('Error removing badge:', error);
      throw error;
    }
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const badgeKeys = userDoc.data()?.badges || [];
      
      return badgeKeys.map(key => ({
        key,
        ...this.availableBadges[key]
      }));
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  /**
   * Auto-award badges based on activity
   */
  async updateAutoBadges(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Check for active badge
      const lastSeen = userData.lastSeen?.toDate();
      if (lastSeen && Date.now() - lastSeen < 5 * 60 * 1000) {
        await this.awardBadge(userId, 'active');
      } else {
        await this.removeBadge(userId, 'active');
      }
      
      // Check for popular badge (top 10% of likes)
      if (userData.likeCount > 50) {
        await this.awardBadge(userId, 'popular');
      }
      
      // Check for responsive badge (message response time)
      if (userData.avgResponseTime && userData.avgResponseTime < 3600000) { // < 1 hour
        await this.awardBadge(userId, 'responsive');
      }
      
      // Check for safety badge
      if (userData.emergencyContactsSet) {
        await this.awardBadge(userId, 'safety');
      }
      
      // Check for new member badge (created < 7 days ago)
      const createdAt = userData.createdAt?.toDate();
      if (createdAt && Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000) {
        await this.awardBadge(userId, 'newMember');
      } else {
        await this.removeBadge(userId, 'newMember');
      }
      
      // Check for trusted user badge
      if (userData.positiveInteractions > 100) {
        await this.awardBadge(userId, 'trustedUser');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating auto badges:', error);
    }
  }

  /**
   * Get badge details
   */
  getBadgeDetails(badgeKey) {
    return this.availableBadges[badgeKey] || null;
  }

  /**
   * Get all available badges
   */
  getAllBadges() {
    return Object.entries(this.availableBadges).map(([key, badge]) => ({
      key,
      ...badge
    }));
  }

  /**
   * Get badge leaderboard
   */
  async getBadgeLeaderboard(badgeKey, limit = 10) {
    try {
      // Query users with this badge, sorted by engagement
      // Return top N users
      return [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}

export default new BadgesService();
