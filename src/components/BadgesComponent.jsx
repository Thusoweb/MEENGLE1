/**
 * Badges Display Component
 * Shows user badges on profile
 */

import React, { useState, useEffect } from 'react';
import badgesService from '../services/badgesService';
import './BadgesComponent.css';

const BadgesComponent = ({ userId, displayMode = 'inline' }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBadge, setHoveredBadge] = useState(null);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const userBadges = await badgesService.getUserBadges(userId);
      setBadges(userBadges);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="badges-loading">Loading badges...</div>;
  }

  if (badges.length === 0) {
    return null;
  }

  if (displayMode === 'inline') {
    return (
      <div className="badges-inline">
        {badges.map(badge => (
          <div
            key={badge.key}
            className="badge-inline"
            onMouseEnter={() => setHoveredBadge(badge.key)}
            onMouseLeave={() => setHoveredBadge(null)}
            style={{ color: badge.color }}
          >
            <span className="badge-icon">{badge.icon}</span>
            {hoveredBadge === badge.key && (
              <div className="badge-tooltip">
                <p className="tooltip-label">{badge.label}</p>
                <p className="tooltip-description">{badge.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (displayMode === 'grid') {
    return (
      <div className="badges-grid">
        <h3>Badges</h3>
        <div className="badges-list">
          {badges.map(badge => (
            <div key={badge.key} className="badge-card">
              <div className="badge-icon-large" style={{ color: badge.color }}>
                {badge.icon}
              </div>
              <p className="badge-label">{badge.label}</p>
              <p className="badge-description">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default BadgesComponent;
