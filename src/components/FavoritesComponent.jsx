/**
 * Favorites Component
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import favoritesService from '../services/favoritesService';
import './FavoritesComponent.css';

const FavoritesComponent = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    loadFavorites();
  }, [user?.uid]);

  const loadFavorites = async () => {
    const favs = await favoritesService.getUserFavorites(user.uid);
    setFavorites(favs);

    const colls = await favoritesService.getUserCollections(user.uid);
    setCollections(colls);
  };

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      await favoritesService.createCollection(user.uid, newCollectionName);
      setNewCollectionName('');
      loadFavorites();
    }
  };

  return (
    <div className="favorites-component">
      <h2>?? Saved Profiles</h2>

      <div className="saved-section">
        <h3>Favorites ({favorites.length})</h3>
        <div className="favorites-grid">
          {favorites.map(fav => (
            <div key={fav.id} className="favorite-item">
              <p>Profile ID: {fav.profileId.substring(0, 8)}</p>
              {fav.notes && <p className="notes">{fav.notes}</p>}
              <small>{new Date(fav.savedAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="collections-section">
        <h3>Collections</h3>
        <div className="create-collection">
          <input 
            type="text"
            placeholder="Create new collection..."
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
          <button onClick={handleCreateCollection}>Create</button>
        </div>

        <div className="collections-list">
          {collections.map(coll => (
            <div key={coll.id} className="collection-item">
              <h4>{coll.name}</h4>
              <p>{coll.profileCount || 0} profiles</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesComponent;
