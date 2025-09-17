import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Outlet, Navigate } from 'react-router-dom';

const AuthWrapper: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if the user is authenticated AND their email is verified
        if (user.emailVerified) {
          setIsAuthenticated(true);
        } else {
          // If authenticated but not verified, redirect to verification page
          setIsAuthenticated(false);
          // Note: The app will automatically redirect to /verify-email via the return statement
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If not authenticated, go to login. If authenticated but not verified, go to verify-email.
  // The logic inside handleLogin already logs out unverified users, so this ensures they can't access protected routes.
  // The handleSignup logic sends the user directly to /verify-email.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthWrapper;