/**
 * Beautiful Profile Rating Service
 * Rate profiles as "beautiful" for premium tier filtering
 */

import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

class BeautifulProfileService {
  /**
   * Set beauty rating (1-10) for a profile
   * Only admins can do this
   */
  async setBeautyRating(profileId, rating) {
    try {
      if (rating < 1 || rating > 10) {
        throw new Error('Rating must be between 1-10');
      }

      const profileRef = doc(db, 'users', profileId);
      await updateDoc(profileRef, {
        beautyRating: rating,
        beautyRatingDate: new Date(),
        isBeautiful: rating >= 8 // 8+ = beautiful
      });

      return true;
    } catch (error) {
      console.error('Error setting beauty rating:', error);
      throw error;
    }
  }

  /**
   * Get beauty rating
   */
  async getBeautyRating(profileId) {
    try {
      const profileRef = doc(db, 'users', profileId);
      const profileDoc = await getDoc(profileRef);

      return profileDoc.data()?.beautyRating || null;
    } catch (error) {
      console.error('Error fetching beauty rating:', error);
      return null;
    }
  }

  /**
   * Check if profile should be hidden (beautiful + user doesn't have full Wildfire)
   */
  async shouldHideProfile(profileId, userTier) {
    try {
      const rating = await this.getBeautyRating(profileId);

      // Hide beautiful profiles (8+) from non-full-Wildfire users
      if (rating && rating >= 8 && userTier !== 'wildfire_monthly') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking hide status:', error);
      return false;
    }
  }

  /**
   * Get beautiful profiles list
   */
  async getBeautifulProfiles(limit = 50) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('beautyRating', '>=', 8));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        beautyRating: doc.data().beautyRating,
        displayName: doc.data().displayName
      }));
    } catch (error) {
      console.error('Error fetching beautiful profiles:', error);
      return [];
    }
  }
}

export default new BeautifulProfileService();
