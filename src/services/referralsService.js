/**
 * Referral & Rewards Service
 * Track referrals and reward successful signups
 */

import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

class ReferralsService {
  /**
   * Generate referral code for user
   */
  async generateReferralCode(userId) {
    try {
      const code = this.createCode(userId);
      
      const referralRef = doc(db, 'referrals', userId);
      await setDoc(referralRef, {
        userId,
        referralCode: code,
        referralLink: `https://meengle.app?ref=${code}`,
        credits: 0,
        referralCount: 0,
        successfulReferrals: 0,
        createdAt: serverTimestamp()
      }, { merge: true });

      return code;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  }

  /**
   * Create unique referral code
   */
  createCode(userId) {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${userId.substring(0, 4)}${randomString}`;
  }

  /**
   * Track referral signup
   */
  async trackReferralSignup(referralCode, newUserId) {
    try {
      // Find referrer by code
      const referralsRef = collection(db, 'referrals');
      const q = query(referralsRef, where('referralCode', '==', referralCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('Invalid referral code');
        return false;
      }

      const referrerDoc = snapshot.docs[0];
      const referrerId = referrerDoc.id;

      // Create referral record
      const referralRecordRef = collection(db, 'referralHistory');
      await addDoc(referralRecordRef, {
        referrerId,
        referralCode,
        newUserId,
        status: 'pending',
        signupDate: serverTimestamp(),
        activationDate: null,
        rewardAmount: 500 // R5.00 in credits
      });

      return true;
    } catch (error) {
      console.error('Error tracking referral signup:', error);
      return false;
    }
  }

  /**
   * Award referral bonus (when referred user makes purchase)
   */
  async awardReferralBonus(referrerId, referralCode, amount = 500) {
    try {
      const referralRef = doc(db, 'referrals', referrerId);
      const referralDoc = await getDoc(referralRef);

      if (referralDoc.exists()) {
        const currentCredits = referralDoc.data().credits || 0;
        const successfulCount = referralDoc.data().successfulReferrals || 0;

        await updateDoc(referralRef, {
          credits: currentCredits + amount,
          successfulReferrals: successfulCount + 1
        });

        // Update referral history
        const historyRef = collection(db, 'referralHistory');
        const q = query(
          historyRef,
          where('referrerId', '==', referrerId),
          where('referralCode', '==', referralCode)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          await updateDoc(snapshot.docs[0].ref, {
            status: 'completed',
            rewardDate: serverTimestamp(),
            activationDate: new Date()
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error awarding bonus:', error);
      throw error;
    }
  }

  /**
   * Get referral stats
   */
  async getReferralStats(userId) {
    try {
      const referralRef = doc(db, 'referrals', userId);
      const referralDoc = await getDoc(referralRef);

      return referralDoc.exists() ? referralDoc.data() : {
        credits: 0,
        referralCount: 0,
        successfulReferrals: 0,
        referralCode: null
      };
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }
  }

  /**
   * Get referral history
   */
  async getReferralHistory(userId) {
    try {
      const historyRef = collection(db, 'referralHistory');
      const q = query(historyRef, where('referrerId', '==', userId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        signupDate: doc.data().signupDate?.toDate(),
        activationDate: doc.data().activationDate?.toDate(),
        rewardDate: doc.data().rewardDate?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching referral history:', error);
      return [];
    }
  }

  /**
   * Redeem referral credits
   */
  async redeemCredits(userId, amount) {
    try {
      const referralRef = doc(db, 'referrals', userId);
      const referralDoc = await getDoc(referralRef);

      if (!referralDoc.exists()) {
        throw new Error('No referral account found');
      }

      const currentCredits = referralDoc.data().credits || 0;
      if (currentCredits < amount) {
        throw new Error('Insufficient credits');
      }

      await updateDoc(referralRef, {
        credits: currentCredits - amount
      });

      // Log redemption
      const redemptionRef = collection(db, 'referralRedemptions');
      await addDoc(redemptionRef, {
        userId,
        amount,
        type: 'upgrade', // or 'cashout'
        status: 'completed',
        timestamp: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error redeeming credits:', error);
      throw error;
    }
  }

  /**
   * Get referral leaderboard
   */
  async getReferralLeaderboard(limit = 10) {
    try {
      const referralsRef = collection(db, 'referrals');
      const snapshot = await getDocs(referralsRef);

      return snapshot.docs
        .map(doc => ({
          userId: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => (b.successfulReferrals || 0) - (a.successfulReferrals || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  /**
   * Get referral program info
   */
  getProgramInfo() {
    return {
      rewardPerReferral: 500, // R5.00 in credits
      rewardPerSuccessfulReferral: 500,
      rewardDescription: 'R5.00 credit for each successful referral',
      minimumRedemption: 100, // R1.00
      maximumMonthlyRedemption: 5000, // R50.00
      termsUrl: '/terms/referral'
    };
  }
}

export default new ReferralsService();
