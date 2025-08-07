import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GymListPage from './pages/GymListPage';
import GymDetailPage from './pages/GymDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/gyms" element={<GymListPage />} />
          <Route path="/gyms/:id" element={<GymDetailPage />} />

          {/* Private routes wrapped inside a Route element */}
          <Route
            path="/book/:slotId"
            element={
              <PrivateRoute>
                  <BookingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookingsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
