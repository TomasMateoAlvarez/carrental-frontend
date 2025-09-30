import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={esES}>
        <Router>
          <div style={{ padding: '20px' }}>
            <h1>CarRental App - Test</h1>
            <p>If you can see this, the basic React app is working!</p>
            <Routes>
              <Route path="/" element={<div>Home Page Works!</div>} />
              <Route path="/test" element={<div>Test Route Works!</div>} />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;