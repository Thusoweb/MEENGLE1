/**
 * Subscription Upsells Component
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import subscriptionUpsellsService from '../services/subscriptionUpsellsService';
import './SubscriptionUpsellsComponent.css';

const SubscriptionUpsellsComponent = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    loadOffers();
  }, [user?.uid]);

  const loadOffers = async () => {
    const availableOffers = await subscriptionUpsellsService.getAvailableOffers(user.uid);
    setOffers(availableOffers);
  };

  const handleApplyOffer = async (offerId) => {
    await subscriptionUpsellsService.applyOffer(user.uid, offerId);
    alert('Offer applied! Check your subscription');
  };

  return (
    <div className="subscription-upsells">
      <h2>?? Special Offers</h2>

      {offers.length === 0 ? (
        <p>No active offers available</p>
      ) : (
        <div className="offers-grid">
          {offers.map(offer => (
            <div key={offer.id} className="offer-card">
              <div className="offer-badge">
                {offer.discount && <span>{offer.discount} OFF</span>}
              </div>
              <h3>{offer.label}</h3>
              <p className="offer-desc">{offer.description}</p>
              
              <div className="pricing">
                {offer.originalPrice && (
                  <span className="original">R{(offer.originalPrice / 100).toFixed(2)}</span>
                )}
                <span className="discounted">R{(offer.discountedPrice / 100).toFixed(2)}</span>
              </div>

              {offer.bonus && (
                <p className="bonus">+ {offer.bonus}</p>
              )}

              <button 
                className="apply-btn"
                onClick={() => handleApplyOffer(offer.id)}
              >
                Claim Offer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionUpsellsComponent;
