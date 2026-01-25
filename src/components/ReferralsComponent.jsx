/**
 * Referrals Component
 * Share referral code, track earnings, redeem credits
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import referralsService from '../services/referralsService';
import './ReferralsComponent.css';

const ReferralsComponent = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [user?.uid]);

  const loadReferralData = async () => {
    const stats = await referralsService.getReferralStats(user.uid);
    setStats(stats);

    const history = await referralsService.getReferralHistory(user.uid);
    setHistory(history);

    const leaderboard = await referralsService.getReferralLeaderboard(10);
    setLeaderboard(leaderboard);
  };

  const handleCopyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const programInfo = referralsService.getProgramInfo();

  return (
    <div className="referrals-container">
      <div className="referral-header">
        <h2>?? Referral Program</h2>
        <p>Earn R5 for each successful referral!</p>
      </div>

      {/* Stats Card */}
      {stats && (
        <div className="referral-stats">
          <div className="stat-box">
            <h3>R{(stats.credits / 100).toFixed(2)}</h3>
            <p>Your Credits</p>
          </div>

          <div className="stat-box">
            <h3>{stats.successfulReferrals || 0}</h3>
            <p>Successful Referrals</p>
          </div>

          <div className="stat-box">
            <h3>{stats.referralCount || 0}</h3>
            <p>Total Referrals</p>
          </div>
        </div>
      )}

      {/* Referral Link */}
      <div className="referral-link-card">
        <h3>Share Your Referral Link</h3>
        <div className="link-box">
          <input 
            type="text" 
            value={stats?.referralLink || ''}
            readOnly
            className="link-input"
          />
          <button 
            className="copy-btn"
            onClick={handleCopyLink}
          >
            {copied ? '? Copied!' : 'Copy'}
          </button>
        </div>
        <p className="info">Share this link with friends and earn R5 for each signup!</p>
      </div>

      {/* Program Info */}
      <div className="program-info">
        <h3>How It Works</h3>
        <div className="info-items">
          <div className="info-item">
            <span className="icon">1??</span>
            <div>
              <p><strong>Share Link</strong></p>
              <p>Send your referral link to friends</p>
            </div>
          </div>

          <div className="info-item">
            <span className="icon">2??</span>
            <div>
              <p><strong>They Sign Up</strong></p>
              <p>Friend creates an account using your link</p>
            </div>
          </div>

          <div className="info-item">
            <span className="icon">3??</span>
            <div>
              <p><strong>You Earn!</strong></p>
              <p>Get R{(programInfo.rewardPerReferral / 100).toFixed(2)} credit when they make a purchase</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      {history.length > 0 && (
        <div className="referral-history">
          <h3>Your Referrals</h3>
          <div className="history-list">
            {history.map((ref, idx) => (
              <div key={idx} className="history-item">
                <div>
                  <p className="ref-user">User: {ref.newUserId?.substring(0, 8)}</p>
                  <p className={`ref-status ${ref.status}`}>{ref.status}</p>
                </div>
                <div>
                  <p className="ref-reward">+R{(ref.rewardAmount / 100).toFixed(2)}</p>
                  <p className="ref-date">
                    {new Date(ref.signupDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="leaderboard">
        <h3>?? Top Referrers</h3>
        <div className="leaderboard-list">
          {leaderboard.map((user, idx) => (
            <div key={idx} className="leaderboard-item">
              <span className="rank">{idx + 1}</span>
              <span className="name">{user.userId?.substring(0, 12)}</span>
              <span className="count">{user.successfulReferrals || 0} referrals</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralsComponent;
