import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/designSystem.css';

// Import Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

// Import Pages
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import PaymentPage from './pages/PaymentPage';
import CheckInFeedPage from './pages/CheckInFeedPage';
import ActivityDiscoveryPage from './pages/ActivityDiscoveryPage';

// Login/Auth Pages
const LoginPage = () => (
  <div className="auth-container">
    <h1>MEENGLE</h1>
    <p>Sign in to continue</p>
    <a href="/login.html" className="btn">Login</a>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router basename="/MEENGLE1">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/discover" element={user ? <DiscoverPage /> : <Navigate to="/login" />} />
        <Route path="/activities" element={user ? <ActivityDiscoveryPage /> : <Navigate to="/login" />} />
        <Route path="/check-ins" element={user ? <CheckInFeedPage /> : <Navigate to="/login" />} />
        <Route path="/payment" element={user ? <PaymentPage /> : <Navigate to="/login" />} />
        
        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
