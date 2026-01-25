/**
 * Stories/Moments Component
 * UI for posting and viewing 24hr stories
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import storiesService from '../services/storiesService';
import './StoriesComponent.css';

const StoriesComponent = ({ matchIds = [] }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [activeStoryUser, setActiveStoryUser] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    loadFeedStories();
  }, [matchIds]);

  const loadFeedStories = async () => {
    if (matchIds.length > 0) {
      const feedStories = await storiesService.getFeedStories(matchIds);
      setStories(feedStories);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostStory = async () => {
    if (!selectedFile) {
      alert('Please select a photo/video');
      return;
    }

    try {
      setLoading(true);
      await storiesService.postStory(user.uid, selectedFile, caption);
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      loadFeedStories();
    } catch (error) {
      alert('Error posting story: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStory = async (userId, storyIndex) => {
    setActiveStoryUser(userId);
    setCurrentStoryIndex(storyIndex || 0);
    
    // Record view
    const userStories = stories[userId];
    if (userStories && userStories[storyIndex]) {
      await storiesService.viewStory(userStories[storyIndex].id, user.uid);
    }
  };

  const handleLikeStory = async (storyId) => {
    await storiesService.likeStory(storyId, user.uid);
  };

  const currentStory = activeStoryUser && stories[activeStoryUser]?.[currentStoryIndex];

  return (
    <div className="stories-container">
      {/* Story Viewer Modal */}
      {activeStoryUser && currentStory && (
        <div className="story-viewer-modal">
          <div className="story-viewer">
            <div className="story-header">
              <button 
                className="close-btn"
                onClick={() => setActiveStoryUser(null)}
              >
                ?
              </button>
              <div className="story-user-info">
                <div className="story-avatar"></div>
                <div>
                  <p className="story-username">{activeStoryUser}</p>
                  <p className="story-time">24h ago</p>
                </div>
              </div>
              <button className="more-btn">?</button>
            </div>

            <div className="story-content">
              <img src={currentStory.mediaUrl} alt="Story" />
              {currentStory.caption && (
                <div className="story-caption">{currentStory.caption}</div>
              )}
            </div>

            <div className="story-footer">
              <button 
                className="like-btn"
                onClick={() => handleLikeStory(currentStory.id)}
              >
                ?? Like
              </button>
              <button className="reply-btn">?? Reply</button>
            </div>

            <div className="story-progress">
              {stories[activeStoryUser]?.map((_, idx) => (
                <div 
                  key={idx}
                  className={`progress-bar ${idx === currentStoryIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Story Creation */}
      <div className="story-creation">
        <div className="create-story-card">
          <div className="create-icon">+</div>
          <p>Create Story</p>
        </div>

        {preview && (
          <div className="story-preview-card">
            <img src={preview} alt="Preview" />
            <div className="story-preview-overlay">
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="story-caption-input"
              />
              <button 
                onClick={handlePostStory}
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Story'}
              </button>
              <button 
                onClick={() => { setPreview(null); setSelectedFile(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!preview && (
          <label className="upload-story-label">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="upload-story-box">
              <div className="upload-icon">??</div>
              <p>Add Photo/Video</p>
            </div>
          </label>
        )}
      </div>

      {/* Stories Feed */}
      <div className="stories-feed">
        <h3>Stories</h3>
        <div className="stories-list">
          {Object.entries(stories).map(([userId, userStories]) => (
            <div 
              key={userId}
              className="story-item"
              onClick={() => handleViewStory(userId, 0)}
            >
              <div className="story-thumbnail">
                <img src={userStories[0]?.mediaUrl} alt={userId} />
                <div className="story-indicator">
                  {userStories.length > 1 && (
                    <span className="story-count">{userStories.length}</span>
                  )}
                </div>
              </div>
              <p className="story-username">{userId}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesComponent;
