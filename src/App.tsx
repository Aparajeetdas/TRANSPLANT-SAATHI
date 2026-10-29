import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { queryClient } from './lib/queryClient';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}
