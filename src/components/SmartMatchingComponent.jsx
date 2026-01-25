/**
 * Smart Matching Component
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import smartMatchingService from '../services/smartMatchingService';
import './SmartMatchingComponent.css';

const SmartMatchingComponent = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [matchesOfDay, setMatchesOfDay] = useState(null);

  useEffect(() => {
    loadMatches();
  }, [user?.uid]);

  const loadMatches = async () => {
    const smartMatches = await smartMatchingService.getSmartMatches(user.uid);
    setMatches(smartMatches);

    const motd = await smartMatchingService.getMatchesOfTheDay(user.uid);
    setMatchesOfDay(motd);
  };

  return (
    <div className="smart-matching">
      <h2>?? Smart Matches</h2>
      <p>{matchesOfDay?.message}</p>

      <div className="matches-grid">
        {matches.map(match => (
          <div key={match.id} className="match-card">
            <img src={match.profile?.photoURL} alt={match.profile?.displayName} />
            <div className="match-info">
              <h3>{match.profile?.displayName}, {match.profile?.age}</h3>
              <p className="location">{match.profile?.location?.city}</p>
              <p className="compatibility">
                ?? {match.matchScore}% Compatible
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartMatchingComponent;
