// src/components/PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom'; // Use Navigate instead of Redirect for react-router-dom v6+
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { user } = useAuth(); // Make sure to use the user or remove it if not needed

  return (
    <Route
      {...rest}
      element={user ? <Component /> : <Navigate to="/login" />} // Use Navigate to redirect
    />
  );
};

export default PrivateRoute;
