/**
 * Moments/Stories Service
 * Instagram-like 24hr stories for profiles
 */

import { db, storage } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class StoriesService {
  /**
   * Upload story media
   */
  async uploadStoryMedia(userId, mediaFile) {
    try {
      const storageRef = ref(storage, `stories/${userId}/${Date.now()}`);
      await uploadBytes(storageRef, mediaFile);
      const mediaUrl = await getDownloadURL(storageRef);
      return mediaUrl;
    } catch (error) {
      console.error('Error uploading story media:', error);
      throw error;
    }
  }

  /**
   * Post a story
   */
  async postStory(userId, mediaFile, caption = '') {
    try {
      const mediaUrl = await this.uploadStoryMedia(userId, mediaFile);
      
      const storiesRef = collection(db, 'stories');
      const storyDoc = await addDoc(storiesRef, {
        userId,
        mediaUrl,
        caption,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        views: [],
        likes: []
      });
      
      return storyDoc.id;
    } catch (error) {
      console.error('Error posting story:', error);
      throw error;
    }
  }

  /**
   * Get user's stories (not expired)
   */
  async getUserStories(userId) {
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(
        storiesRef,
        where('userId', '==', userId),
        where('expiresAt', '>', new Date())
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching user stories:', error);
      return [];
    }
  }

  /**
   * Get feed stories (from matches/followers)
   */
  async getFeedStories(userIds) {
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(
        storiesRef,
        where('userId', 'in', userIds),
        where('expiresAt', '>', new Date())
      );
      
      const snapshot = await getDocs(q);
      const stories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate()
      }));
      
      // Group by user
      return stories.reduce((acc, story) => {
        if (!acc[story.userId]) {
          acc[story.userId] = [];
        }
        acc[story.userId].push(story);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching feed stories:', error);
      return {};
    }
  }

  /**
   * Record story view
   */
  async viewStory(storyId, viewerId) {
    try {
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        views: [...(await this.getStoryViews(storyId)), viewerId]
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }

  /**
   * Like story
   */
  async likeStory(storyId, userId) {
    try {
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        likes: [...(await this.getStoryLikes(storyId)), userId]
      });
    } catch (error) {
      console.error('Error liking story:', error);
    }
  }

  /**
   * Get story views
   */
  async getStoryViews(storyId) {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      return storyDoc.data()?.views || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get story likes
   */
  async getStoryLikes(storyId) {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      return storyDoc.data()?.likes || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete story
   */
  async deleteStory(storyId) {
    try {
      await deleteDoc(doc(db, 'stories', storyId));
      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  /**
   * Auto-delete expired stories (run on backend)
   */
  async cleanupExpiredStories() {
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, where('expiresAt', '<', new Date()));
      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }
      
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error cleaning up stories:', error);
      return 0;
    }
  }
}

export default new StoriesService();
