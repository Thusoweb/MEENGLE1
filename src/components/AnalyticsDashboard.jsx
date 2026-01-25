/**
 * Analytics Dashboard Component
 * Admin dashboard for metrics
 */

import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const dau = await analyticsService.getDailyActiveUsers();
      const conversion = await analyticsService.getConversionRate();
      const revenue = await analyticsService.getRevenueMetrics();
      const tiers = await analyticsService.getTierDistribution();
      const engagement = await analyticsService.getEngagementMetrics();
      const churn = await analyticsService.getChurnRate();

      setMetrics({
        dau,
        conversion,
        revenue,
        tiers,
        engagement,
        churn
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>?? Analytics Dashboard</h1>
        <button onClick={loadMetrics} className="refresh-btn">?? Refresh</button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Daily Active Users</h3>
          <p className="metric-value">{metrics?.dau || 0}</p>
        </div>

        <div className="metric-card">
          <h3>Conversion Rate</h3>
          <p className="metric-value">{metrics?.conversion || 0}%</p>
        </div>

        <div className="metric-card">
          <h3>Monthly Revenue</h3>
          <p className="metric-value">R{metrics?.revenue?.monthlyRevenue || 0}</p>
        </div>

        <div className="metric-card">
          <h3>Churn Rate</h3>
          <p className="metric-value">{metrics?.churn || 0}%</p>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="chart-card">
        <h3>User Distribution by Tier</h3>
        <div className="tier-chart">
          {metrics?.tiers && Object.entries(metrics.tiers).map(([tier, count]) => (
            <div key={tier} className="tier-bar">
              <span className="tier-name">{tier}</span>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{
                    width: `${(count / (Object.values(metrics.tiers).reduce((a, b) => a + b, 0))) * 100}%`
                  }}
                />
              </div>
              <span className="bar-value">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="engagement-card">
        <h3>Engagement Metrics</h3>
        <div className="engagement-grid">
          <div className="engagement-item">
            <p className="label">Total Matches</p>
            <p className="value">{metrics?.engagement?.totalMatches || 0}</p>
          </div>
          <div className="engagement-item">
            <p className="label">Total Messages</p>
            <p className="value">{metrics?.engagement?.totalMessages || 0}</p>
          </div>
          <div className="engagement-item">
            <p className="label">Total Likes</p>
            <p className="value">{metrics?.engagement?.totalLikes || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
