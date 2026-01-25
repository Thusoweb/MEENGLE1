/**
 * One-Time Purchases Component
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import oneTimePurchasesService from '../services/oneTimePurchasesService';
import './OneTimePurchasesComponent.css';

const OneTimePurchasesComponent = () => {
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState(null);

  const products = oneTimePurchasesService.getAllProducts();

  const handlePurchase = async (productId) => {
    try {
      setPurchasing(productId);
      await oneTimePurchasesService.purchaseItem(user.uid, productId);
      alert(`${products.find(p => p.id === productId)?.name} purchased!`);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="one-time-purchases">
      <h2>? One-Time Boosts</h2>
      <p>Give yourself an extra edge with these powerful tools</p>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-icon">{product.icon}</div>
            <h3>{product.name}</h3>
            <p className="product-desc">{product.description}</p>
            <p className="product-benefit">{product.benefit}</p>
            <div className="product-footer">
              <span className="price">R{(product.price / 100).toFixed(2)}</span>
              <button 
                onClick={() => handlePurchase(product.id)}
                disabled={purchasing === product.id}
              >
                {purchasing === product.id ? 'Purchasing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OneTimePurchasesComponent;
