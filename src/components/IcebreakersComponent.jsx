/**
 * Icebreakers Component
 * UI for suggesting and using conversation starters
 */

import React, { useState, useEffect } from 'react';
import icebreakersService from '../services/icebreakersService';
import './IcebreakersComponent.css';

const IcebreakersComponent = ({ matchProfile, onSelectIcebreaker }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allIcebreakers, setAllIcebreakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIcebreakers();
  }, [matchProfile]);

  const loadIcebreakers = async () => {
    try {
      setLoading(true);
      
      // Get suggested based on profile
      const suggested = await icebreakersService.getSuggestedIcebreakers(matchProfile);
      setSuggestions(suggested);
      
      // Get all for category selection
      const all = icebreakersService.defaultIcebreakers;
      setAllIcebreakers(all);
    } finally {
      setLoading(false);
    }
  };

  const getFiltered = () => {
    if (selectedCategory === 'all') {
      return suggestions;
    }
    return allIcebreakers.filter(i => i.category === selectedCategory);
  };

  const categories = icebreakersService.getCategories();
  const filtered = getFiltered();

  if (loading) {
    return <div className="icebreakers-loading">Loading conversation starters...</div>;
  }

  return (
    <div className="icebreakers-container">
      <div className="icebreakers-header">
        <h3>?? Break the Ice</h3>
        <p>Choose a conversation starter or pick your favorite</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Suggested
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Icebreakers List */}
      <div className="icebreakers-list">
        {filtered.length === 0 ? (
          <p className="no-icebreakers">No conversation starters available</p>
        ) : (
          filtered.map((icebreaker, idx) => (
            <div key={idx} className="icebreaker-item">
              <div className="icebreaker-text">
                "{icebreaker.text}"
              </div>
              <div className="icebreaker-actions">
                <span className="category-tag">{icebreaker.category}</span>
                <button 
                  className="use-btn"
                  onClick={() => {
                    onSelectIcebreaker(icebreaker.text);
                    icebreakersService.trackUsage(matchProfile.id, icebreaker.text);
                  }}
                >
                  Use This
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Icebreaker Stats */}
      <div className="icebreaker-stats">
        <p>?? Most people use "genuine" conversation starters and get faster responses!</p>
      </div>
    </div>
  );
};

export default IcebreakersComponent;
