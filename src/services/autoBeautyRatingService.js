/**
 * Automatic Beauty Rating Service
 * Intelligently identifies beautiful profiles based on engagement
 */

import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

class AutoBeautyRatingService {
  /**
   * Update beauty rating based on engagement metrics
   * Called periodically (every 6 hours) or after significant engagement
   */
  async updateBeautyRatings() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      for (const userDoc of snapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Calculate engagement score
        const engagementScore = await this.calculateEngagementScore(userId, userData);
        
        // Convert to beauty rating (1-10)
        const beautyRating = this.engagementToBeautyRating(engagementScore);

        // Update if rating changed
        if (beautyRating !== userData.beautyRating) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            beautyRating: beautyRating,
            beautyRatingUpdated: serverTimestamp(),
            engagementScore: engagementScore,
            isBeautiful: beautyRating >= 8
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating beauty ratings:', error);
      throw error;
    }
  }

  /**
   * Calculate engagement score for a user
   */
  async calculateEngagementScore(userId, userData) {
    try {
      const createdAt = userData.createdAt?.toDate();
      const now = new Date();
      const ageInHours = (now - createdAt) / (1000 * 60 * 60);

      // Get metrics
      const likeCount = userData.likeCount || 0;
      const matchCount = userData.matchCount || 0;
      const profileViews = userData.profileViews || 0;
      const messageCount = userData.messageCount || 0;
      const photosCount = userData.photos?.length || 1;

      // Calculate engagement rate (normalized to per-day)
      const daysOld = Math.max(1, ageInHours / 24);
      const likesPerDay = likeCount / daysOld;
      const matchesPerDay = matchCount / daysOld;
      const viewsPerDay = profileViews / daysOld;

      // Weighted engagement score
      // Likes are most important (shows attractiveness)
      // Matches show compatibility too
      // Views show profile quality
      const engagementScore = 
        (likesPerDay * 0.5) +        // 50% weight on likes
        (matchesPerDay * 0.3) +      // 30% weight on matches
        (viewsPerDay * 0.2) +        // 20% weight on views
        (photosCount > 3 ? 5 : 0);   // Bonus for multiple photos

      return Math.round(engagementScore);
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return 0;
    }
  }

  /**
   * Convert engagement score to beauty rating (1-10)
   */
  engagementToBeautyRating(engagementScore) {
    // Engagement score to beauty rating mapping
    if (engagementScore < 1) return 3;      // Very low engagement
    if (engagementScore < 3) return 4;      // Low engagement
    if (engagementScore < 5) return 5;      // Below average
    if (engagementScore < 8) return 6;      // Average
    if (engagementScore < 12) return 7;     // Above average
    if (engagementScore < 18) return 8;     // Beautiful ?
    if (engagementScore < 25) return 9;     // Very beautiful ??
    return 10;                              // Extremely beautiful ???
  }

  /**
   * Quick check: Is this profile beautiful right now?
   */
  async isBeautiful(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const rating = userDoc.data()?.beautyRating || 0;
      return rating >= 8;
    } catch (error) {
      console.error('Error checking beauty status:', error);
      return false;
    }
  }

  /**
   * Get top beautiful profiles (for admin dashboard)
   */
  async getTopBeautifulProfiles(limit = 20) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('beautyRating', '>=', 8));
      const snapshot = await getDocs(q);

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          beautyRating: doc.data().beautyRating,
          displayName: doc.data().displayName,
          likeCount: doc.data().likeCount || 0,
          matchCount: doc.data().matchCount || 0
        }))
        .sort((a, b) => b.beautyRating - a.beautyRating)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching beautiful profiles:', error);
      return [];
    }
  }

  /**
   * Manually override beauty rating (admin only)
   */
  async overrideBeautyRating(userId, rating) {
    try {
      if (rating < 1 || rating > 10) {
        throw new Error('Rating must be between 1-10');
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        beautyRating: rating,
        beautyRatingOverride: true,
        isBeautiful: rating >= 8
      });

      return true;
    } catch (error) {
      console.error('Error overriding beauty rating:', error);
      throw error;
    }
  }

  /**
   * Get beauty rating breakdown
   */
  async getBeautyStats() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const stats = {
        total: snapshot.docs.length,
        beautiful: 0,
        veryBeautiful: 0,
        extremelyBeautiful: 0,
        distribution: {}
      };

      snapshot.docs.forEach(doc => {
        const rating = doc.data().beautyRating || 0;
        
        if (rating >= 8) stats.beautiful++;
        if (rating >= 9) stats.veryBeautiful++;
        if (rating === 10) stats.extremelyBeautiful++;

        // Distribution by rating
        stats.distribution[rating] = (stats.distribution[rating] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching beauty stats:', error);
      return {};
    }
  }
}

export default new AutoBeautyRatingService();
