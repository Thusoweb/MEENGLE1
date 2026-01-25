/**
 * Moderation Panel Component
 */

import React, { useState, useEffect } from 'react';
import moderationService from '../services/moderationService';
import './ModerationPanel.css';

const ModerationPanel = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadModeration();
  }, []);

  const loadModeration = async () => {
    const reportsData = await moderationService.getReports('pending');
    setReports(reportsData);
    const statsData = await moderationService.getModerationStats();
    setStats(statsData);
  };

  const handleBanUser = async (userId) => {
    await moderationService.banUser(userId, 'Policy violation');
    loadModeration();
  };

  const handleResolveReport = async (reportId) => {
    await moderationService.resolveReport(reportId, 'ban', 'User banned');
    loadModeration();
  };

  return (
    <div className="moderation-panel">
      <div className="mod-header">
        <h1>?? Moderation Panel</h1>
      </div>

      {stats && (
        <div className="mod-stats">
          <div className="stat">
            <p className="label">Pending Reports</p>
            <p className="value">{stats.pendingReports}</p>
          </div>
          <div className="stat">
            <p className="label">Total Reports</p>
            <p className="value">{stats.totalReports}</p>
          </div>
          <div className="stat">
            <p className="label">Banned Users</p>
            <p className="value">{stats.bannedUsers}</p>
          </div>
        </div>
      )}

      <div className="reports-section">
        <h2>Pending Reports</h2>
        <div className="reports-list">
          {reports.length === 0 ? (
            <p>No pending reports</p>
          ) : (
            reports.map(report => (
              <div key={report.id} className="report-item">
                <div className="report-info">
                  <p className="report-user">User: {report.reportedUserId?.substring(0, 8)}</p>
                  <p className="report-reason">{report.reason}</p>
                  <p className="report-date">{new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="report-actions">
                  <button onClick={() => handleBanUser(report.reportedUserId)}>Ban User</button>
                  <button onClick={() => handleResolveReport(report.id)}>Resolve</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationPanel;
