/**
 * Notifications Component
 * Display in-app notifications with preferences
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationsService from '../services/notificationsService';
import './NotificationsComponent.css';

const NotificationsComponent = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [user?.uid]);

  const loadNotifications = async () => {
    const notifs = await notificationsService.getUserNotifications(user.uid);
    setNotifications(notifs);
    
    const unread = await notificationsService.getUnreadCount(user.uid);
    setUnreadCount(unread);
  };

  const loadPreferences = async () => {
    const prefs = await notificationsService.getPreferences(user.uid);
    setPreferences(prefs);
  };

  const handleMarkAsRead = async (notificationId) => {
    await notificationsService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleDelete = async (notificationId) => {
    await notificationsService.deleteNotification(notificationId);
    loadNotifications();
  };

  const handlePreferenceChange = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    await notificationsService.setPreferences(user.uid, updated);
    setPreferences(updated);
  };

  return (
    <div className="notifications-wrapper">
      {/* Notification Bell */}
      <button 
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
      >
        ??
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>Notifications</h3>
            <button onClick={() => setShowPanel(false)}>?</button>
          </div>

          {/* Preferences Tab */}
          <div className="panel-tabs">
            <button className="tab-btn active">Inbox</button>
            <button className="tab-btn">Settings</button>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p className="empty">No notifications yet</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                >
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-message">{notif.message}</p>
                    <p className="notif-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="notif-actions">
                    {!notif.read && (
                      <button 
                        className="mark-read-btn"
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        ?
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(notif.id)}
                    >
                      ?
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preferences */}
          {preferences && (
            <div className="notification-preferences">
              <h4>Notification Preferences</h4>
              
              <label className="pref-item">
                <input
                  type="checkbox"
                  checked={preferences.matchNotifications}
                  onChange={() => handlePreferenceChange('matchNotifications')}
                />
                <span>Match Notifications</span>
              </label>

              <label className="pref-item">
                <input
                  type="checkbox"
                  checked={preferences.messageNotifications}
                  onChange={() => handlePreferenceChange('messageNotifications')}
                />
                <span>Message Notifications</span>
              </label>

              <label className="pref-item">
                <input
                  type="checkbox"
                  checked={preferences.likeNotifications}
                  onChange={() => handlePreferenceChange('likeNotifications')}
                />
                <span>Like Notifications</span>
              </label>

              <label className="pref-item">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={() => handlePreferenceChange('pushNotifications')}
                />
                <span>Push Notifications</span>
              </label>

              <label className="pref-item">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => handlePreferenceChange('emailNotifications')}
                />
                <span>Email Notifications</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsComponent;
