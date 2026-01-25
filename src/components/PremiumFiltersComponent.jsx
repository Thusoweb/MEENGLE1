/**
 * Premium Filters Component
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import premiumFiltersService from '../services/premiumFiltersService';
import './PremiumFiltersComponent.css';

const PremiumFiltersComponent = ({ userTier }) => {
  const { user } = useAuth();
  const [availableFilters, setAvailableFilters] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    const filters = premiumFiltersService.getFiltersByTier(userTier);
    setAvailableFilters(filters);
  }, [userTier]);

  const handleFilterChange = (filterType, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="premium-filters">
      <h2>?? Advanced Filters</h2>
      <p className="tier-badge">{userTier?.toUpperCase()} TIER</p>

      <div className="filters-grid">
        {availableFilters.map(filter => (
          <div key={filter} className="filter-control">
            <label>{filter.replace('_', ' ')}</label>
            
            {filter === 'age' && (
              <div className="range-filter">
                <input 
                  type="number" 
                  placeholder="Min"
                  onChange={(e) => handleFilterChange(filter, {
                    ...filterValues[filter],
                    min: e.target.value
                  })}
                />
                <span>-</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  onChange={(e) => handleFilterChange(filter, {
                    ...filterValues[filter],
                    max: e.target.value
                  })}
                />
              </div>
            )}

            {['education', 'income', 'relationship_goal'].includes(filter) && (
              <select onChange={(e) => handleFilterChange(filter, e.target.value)}>
                <option>Select...</option>
                {premiumFiltersService.getFilterOptions(filter).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}

            {['verified', 'smoker'].includes(filter) && (
              <label className="checkbox">
                <input type="checkbox" onChange={(e) => handleFilterChange(filter, e.target.checked)} />
                <span>{filter}</span>
              </label>
            )}
          </div>
        ))}
      </div>

      <button className="apply-filters">Apply Filters</button>
    </div>
  );
};

export default PremiumFiltersComponent;
