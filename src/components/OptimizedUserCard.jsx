/**
 * Optimized User Card Component
 * 60FPS smooth swiping with GPU acceleration
 * Uses existing design system + themes
 */

import React from 'react';
import { useRef, useState, useCallback } from 'react';
import './OptimizedUserCard.css';

const OptimizedUserCard = React.memo(({ user, onLike, onPass }) => {
  const cardRef = useRef();
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);

  const handleTouchStart = useCallback((e) => {
    setStartX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    setOffset(diff);
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
    }
  }, [startX]);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(offset) > 100) {
      if (offset > 0) {
        onLike(user.uid);
      } else {
        onPass(user.uid);
      }
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      }
    }
    setOffset(0);
  }, [offset, user.uid, onLike, onPass]);

  return (
    <div
      ref={cardRef}
      className="optimized-user-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={user.photoURL}
        alt={user.displayName}
        className="card-image"
        loading="lazy"
      />
      <div className="card-info">
        <h2>{user.displayName}, {user.age}</h2>
        <p className="location">?? {user.location}</p>
        <p className="bio">{user.bio}</p>
        <div className="interests">
          {user.interests?.slice(0, 3).map(interest => (
            <span key={interest} className="tag">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

OptimizedUserCard.displayName = 'OptimizedUserCard';

export default OptimizedUserCard;
