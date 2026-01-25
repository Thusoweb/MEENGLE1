/**
 * Smart Matching Service
 * ML-powered matching algorithm with behavioral predictions
 */

import { db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

class SmartMatchingService {
  /**
   * Get smart match recommendations
   */
  async getSmartMatches(userId, limit = 10) {
    try {
      // Get user profile
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userProfile = userDoc.data();

      // Get all potential candidates
      const candidatesRef = collection(db, 'users');
      const snapshot = await getDocs(candidatesRef);

      let candidates = snapshot.docs
        .filter(doc => doc.id !== userId && !doc.data().banned)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          matchScore: 0
        }));

      // SILENT BEAUTIFUL PROFILE FILTERING (no visible messaging)
      // Only full Wildfire (R199.99/month) subscribers see profiles rated 8+
      // Everyone else just gets fewer matches - they don't know why
      if (userProfile.tier !== 'wildfire_monthly') {
        candidates = candidates.filter(candidate => {
          // Silently hide beautiful profiles (rating 8+) from non-monthly-wildfire users
          if (candidate.beautyRating && candidate.beautyRating >= 8) {
            return false;
          }
          return true;
        });
      }

      // Calculate smart match scores
      const scoredCandidates = candidates.map(candidate => ({
        ...candidate,
        matchScore: this.calculateSmartScore(userProfile, candidate)
      }));

      // Sort by score and return top matches
      return scoredCandidates
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting smart matches:', error);
      return [];
    }
  }

  /**
   * Calculate smart match score using ML approach
   */
  calculateSmartScore(userProfile, candidateProfile) {
    let score = 0;

    // 1. Interest compatibility (25 points)
    const commonInterests = this.getCommonInterests(
      userProfile.interests,
      candidateProfile.interests
    );
    score += commonInterests.length * 2;

    // 2. Age compatibility (20 points)
    const ageDiff = Math.abs(userProfile.age - candidateProfile.age);
    score += Math.max(0, 20 - ageDiff * 0.5);

    // 3. Location proximity (20 points)
    const distance = this.calculateDistance(userProfile.location, candidateProfile.location);
    score += Math.max(0, 20 - distance * 0.2);

    // 4. Behavior patterns (20 points)
    const behaviorScore = this.getBehaviorScore(userProfile, candidateProfile);
    score += behaviorScore;

    // 5. Response rate (10 points)
    const responseScore = this.getResponseScore(candidateProfile.avgResponseTime);
    score += responseScore;

    // 6. Profile completeness (5 points)
    const profileScore = this.getProfileCompletenessScore(candidateProfile);
    score += profileScore;

    return Math.round(score);
  }

  /**
   * Get behavior matching score
   */
  getBehaviorScore(userProfile, candidateProfile) {
    let score = 0;

    // Match on relationship goals
    if (userProfile.relationshipGoal === candidateProfile.relationshipGoal) {
      score += 8;
    }

    // Match on personality type
    if (userProfile.personalityType === candidateProfile.personalityType) {
      score += 6;
    }

    // Match on education
    if (userProfile.education === candidateProfile.education) {
      score += 3;
    }

    // Match on smoking/drinking preferences
    if (userProfile.smoker === candidateProfile.smoker) {
      score += 2;
    }
    if (userProfile.drinker === candidateProfile.drinker) {
      score += 1;
    }

    return score;
  }

  /**
   * Get response score (users who respond quickly get higher matches)
   */
  getResponseScore(avgResponseTime) {
    if (!avgResponseTime) return 0;

    // Convert to minutes
    const minutes = avgResponseTime / 60000;

    if (minutes < 60) return 10; // Responds within 1 hour
    if (minutes < 240) return 8; // Responds within 4 hours
    if (minutes < 1440) return 5; // Responds within 1 day
    return 2; // Responds slowly
  }

  /**
   * Get profile completeness score
   */
  getProfileCompletenessScore(profile) {
    let score = 0;
    const maxPoints = 5;

    if (profile.photos && profile.photos.length > 2) score += 1;
    if (profile.verified) score += 2;
    if (profile.bio && profile.bio.length > 100) score += 1;
    if (profile.interests && profile.interests.length > 3) score += 1;

    return Math.min(score, maxPoints);
  }

  /**
   * Get common interests
   */
  getCommonInterests(userInterests = [], candidateInterests = []) {
    return userInterests.filter(interest =>
      candidateInterests.includes(interest)
    );
  }

  /**
   * Calculate distance between locations (simplified)
   */
  calculateDistance(loc1, loc2) {
    if (!loc1 || !loc2) return 100;

    const lat1 = loc1.latitude;
    const lon1 = loc1.longitude;
    const lat2 = loc2.latitude;
    const lon2 = loc2.longitude;

    const R = 6371; // Radius of Earth in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  toRad(value) {
    return (value * Math.PI) / 180;
  }

  /**
   * Get personalized "matches of the day"
   */
  async getMatchesOfTheDay(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      // Get smart matches
      const smartMatches = await this.getSmartMatches(userId, 5);

      return {
        message: '?? Your top matches today based on your activity and preferences',
        matches: smartMatches
      };
    } catch (error) {
      console.error('Error getting matches of the day:', error);
      return { message: '', matches: [] };
    }
  }

  /**
   * Predict match success
   */
  async predictMatchSuccess(user1Id, user2Id) {
    try {
      const user1Ref = doc(db, 'users', user1Id);
      const user2Ref = doc(db, 'users', user2Id);

      const user1Doc = await getDoc(user1Ref);
      const user2Doc = await getDoc(user2Ref);

      const score = this.calculateSmartScore(user1Doc.data(), user2Doc.data());

      // Convert to success probability (0-100%)
      const successRate = Math.min((score / 100) * 100, 100);

      return {
        score,
        successRate: Math.round(successRate),
        prediction: successRate > 70 ? 'Highly Compatible' : 
                   successRate > 50 ? 'Compatible' : 
                   'Possible Match'
      };
    } catch (error) {
      console.error('Error predicting match success:', error);
      return null;
    }
  }
}

export default new SmartMatchingService();
