/**
 * Photo Verification Service
 * Ensures profiles have real people, reduces catfishing
 */

import { db, storage } from '../config/firebase';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class PhotoVerificationService {
  /**
   * Upload verification photo
   */
  async uploadVerificationPhoto(userId, photoFile) {
    try {
      const storageRef = ref(storage, `verification/${userId}/${Date.now()}`);
      await uploadBytes(storageRef, photoFile);
      const photoUrl = await getDownloadURL(storageRef);
      
      return photoUrl;
    } catch (error) {
      console.error('Error uploading verification photo:', error);
      throw error;
    }
  }

  /**
   * Submit photo for verification
   */
  async submitPhotoForVerification(userId, photoFile) {
    try {
      const photoUrl = await this.uploadVerificationPhoto(userId, photoFile);
      
      const verificationRef = doc(db, 'photoVerifications', userId);
      await setDoc(verificationRef, {
        userId,
        photoUrl,
        status: 'pending',
        submittedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        notes: null,
        approved: false
      }, { merge: true });
      
      return { status: 'pending', photoUrl };
    } catch (error) {
      console.error('Error submitting photo:', error);
      throw error;
    }
  }

  /**
   * Check verification status
   */
  async getVerificationStatus(userId) {
    try {
      const verificationRef = doc(db, 'photoVerifications', userId);
      const verificationDoc = await getDoc(verificationRef);
      
      if (!verificationDoc.exists()) {
        return {
          status: 'not_submitted',
          approved: false,
          badge: null
        };
      }
      
      const data = verificationDoc.data();
      return {
        status: data.status,
        approved: data.approved,
        badge: data.approved ? '? Verified' : null,
        submittedAt: data.submittedAt,
        reviewedAt: data.reviewedAt
      };
    } catch (error) {
      console.error('Error fetching verification status:', error);
      return { status: 'error', approved: false };
    }
  }

  /**
   * Approve verification (admin only)
   */
  async approveVerification(userId, adminId) {
    try {
      const verificationRef = doc(db, 'photoVerifications', userId);
      await updateDoc(verificationRef, {
        status: 'approved',
        approved: true,
        reviewedAt: serverTimestamp(),
        reviewedBy: adminId
      });
      
      // Add badge to user profile
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        badges: ['verified'],
        verifiedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error approving verification:', error);
      throw error;
    }
  }

  /**
   * Reject verification
   */
  async rejectVerification(userId, adminId, reason) {
    try {
      const verificationRef = doc(db, 'photoVerifications', userId);
      await updateDoc(verificationRef, {
        status: 'rejected',
        approved: false,
        reviewedAt: serverTimestamp(),
        reviewedBy: adminId,
        notes: reason
      });
      
      return true;
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  }

  /**
   * Resubmit after rejection
   */
  async resubmitVerification(userId, photoFile) {
    try {
      const photoUrl = await this.uploadVerificationPhoto(userId, photoFile);
      
      const verificationRef = doc(db, 'photoVerifications', userId);
      await updateDoc(verificationRef, {
        photoUrl,
        status: 'pending',
        submittedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        notes: null
      });
      
      return { status: 'pending', photoUrl };
    } catch (error) {
      console.error('Error resubmitting verification:', error);
      throw error;
    }
  }

  /**
   * Get pending verifications (admin dashboard)
   */
  async getPendingVerifications(limit = 10) {
    try {
      // Query Firestore for pending verifications
      // Returns array of pending photo verifications
      return [];
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return [];
    }
  }
}

export default new PhotoVerificationService();
