import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Schedule,
  FitnessCenter,
  LocationOn,
  Cancel,
  CheckCircle,
  HourglassEmpty,
  ArrowForward,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { getMyBookings, cancelBooking } from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';

const MyBookingsPage = () => {
  const history = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      history('/login', { state: { from: '/my-bookings' } });
      return;
    }
  
    const fetchBookings_bk = async () => {
      try {
        setLoading(true);
        const response = await getMyBookings();
  
        if (response?.data) {
          setBookings(response.data);
          setFilteredBookings(response.data);
        } else {
          setError('No bookings found');
        }
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError(err?.message || 'Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };

   const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await getMyBookings();

        if (Array.isArray(response?.data)) {
          setBookings(response.data);  // Store all bookings
          setFilteredBookings(response.data);  // Initial tab (All)
        } else {
          setError('No bookings found');
        }
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError(err?.message || 'Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };
  
    fetchBookings();
  }, [history]);
  

  // useEffect(() => {
  //   let filtered = [...bookings];

  //   if (tabValue === 1) {
  //     filtered = filtered.filter((b) => new Date(b.date) >= new Date());
  //   } else if (tabValue === 2) {
  //     filtered = filtered.filter((b) => new Date(b.date) < new Date());
  //   }

  //   if (selectedDate) {
  //     const selectedStr = selectedDate.toISOString().split('T')[0];
  //     filtered = filtered.filter((b) => {
  //       const bookingStr = new Date(b.date).toISOString().split('T')[0];
  //       return bookingStr === selectedStr;
  //     });
  //   }

  //   setFilteredBookings(filtered);
  // }, [bookings, tabValue, selectedDate]);

  useEffect(() => {
    const now = new Date();
  
    let filtered = bookings.filter((booking) => {
      if (!booking.date || !booking.endTime) return false;
  
      const [endHour, endMinute] = booking.endTime.split(':').map(Number);
      const bookingEnd = new Date(booking.date);
      bookingEnd.setHours(endHour);
      bookingEnd.setMinutes(endMinute);
      bookingEnd.setSeconds(0);
      bookingEnd.setMilliseconds(0);
  
      if (tabValue === 1) {
        // Upcoming
        return bookingEnd > now;
      } else if (tabValue === 2) {
        // Past
        return bookingEnd <= now;
      }
      // tabValue === 0 -> All bookings
      return true;
    });
  
    setFilteredBookings(filtered);
  }, [tabValue, bookings]);

  
  const getStatusChip = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const isUpcoming = bookingDate > now;
    const isPast = bookingDate < now;

    if (booking.cancelled) {
      return (
        <Chip
          icon={<Cancel />}
          label="Cancelled"
          color="secondary"
          sx={{ ml: 1 }}
        />
      );
    }

    if (isUpcoming) {
      return (
        <Chip
          icon={<HourglassEmpty />}
          label="Upcoming"
          color="primary"
          sx={{ ml: 1 }}
        />
      );
    }

    if (isPast) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Completed"
          sx={{ ml: 1 }}
        />
      );
    }

    return null;
  };

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const applyTabFilter = (allBookings, tab) => {
    const now = new Date();
  
    const filtered = allBookings.filter((booking) => {
      if (!booking.date || !booking.endTime) return false;
  
      const [endHour, endMinute] = booking.endTime.split(':').map(Number);
      const bookingEnd = new Date(booking.date);
      bookingEnd.setHours(endHour);
      bookingEnd.setMinutes(endMinute);
      bookingEnd.setSeconds(0);
      bookingEnd.setMilliseconds(0);
  
      if (tab === 1) return bookingEnd > now; // Upcoming
      if (tab === 2) return bookingEnd <= now; // Past
      return true; // All
    });
  
    setFilteredBookings(filtered);
  };

  useEffect(() => {
    if (!selectedDate) {
      applyTabFilter(bookings, tabValue);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      handleDateChange(selectedDate);
    } else {
      applyTabFilter(bookings, tabValue);
    }
  }, [tabValue, bookings]);

  const handleClearDateFilter = () => {
    setSelectedDate(null);
    setTabValue(0); // Assuming tab 0 is "All"
    setFilteredBookings(bookings); // Reset to full list
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  
    if (!date) {
      // Reset to full list for current tab if date is cleared
      applyTabFilter(bookings, tabValue);
      return;
    }
  
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
  
    const filtered = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
  
      return bookingDate.getTime() === selected.getTime();
    });
  
    setFilteredBookings(filtered);
  };
  

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelBooking(bookingToCancel._id);
      setBookings(bookings.filter((b) => b._id !== bookingToCancel._id));
      setCancelDialogOpen(false);
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const handleViewGym = (gymId) => {
    history(`/gyms/${gymId}`);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ pt: 8, pb: 4 }} maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Bookings
        </Typography>
        <Typography color="text.secondary">
          View and manage your upcoming and past bookings
        </Typography>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <DatePicker
          label="Filter by date"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} />}
        />

        <Button onClick={handleClearDateFilter} sx={{ ml: 2 }}>
          Clear Date Filter
        </Button>
      </Box>

      </LocalizationProvider>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="All" />
        <Tab label="Upcoming" />
        <Tab label="Past" />
      </Tabs>

      <Divider sx={{ my: 3 }} />

      {filteredBookings.length === 0 ? (
        <Paper sx={{ textAlign: 'center', p: 4 }}>
          <HourglassEmpty sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No bookings found
          </Typography>
          <Typography color="text.secondary" paragraph>
            {tabValue === 0
              ? "You haven't made any bookings yet."
              : tabValue === 1
              ? "You don't have any upcoming bookings."
              : "You don't have any past bookings."}
          </Typography>
          <Button variant="contained" onClick={() => history('/gyms')}>
            Browse Gyms
          </Button>
        </Paper>
      ) : (
        filteredBookings.map((booking) => (
          <Paper
            key={booking._id}
            elevation={2}
            sx={{
              p: 3,
              mb: 2,
              transition: '0.3s',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box
                  component="img"
                  src={booking.gym.images[0]?.url || 'https://via.placeholder.com/300x200'}
                  alt={booking.gym.name}
                  sx={{
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {booking.gym.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday fontSize="small" sx={{ color: 'action.active' }} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime fontSize="small" sx={{ color: 'action.active' }} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {booking.startTime} - {booking.endTime}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" sx={{ color: 'action.active' }} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {booking.gym?.address?.street || 'Location not available'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FitnessCenter fontSize="small" sx={{ color: 'action.active' }} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Slot Type: {booking.slotType || 'Standard'}
                  </Typography>
                  {getStatusChip(booking)}
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    ₹{booking.amountPaid || '0.00'}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<ArrowForward />}
                      fullWidth
                      sx={{ mb: 1 }}
                      onClick={() => handleViewGym(booking.gym._id)}
                    >
                      View Gym
                    </Button>
                    {new Date(booking.date) > new Date() && !booking.cancelled && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Cancel />}
                        fullWidth
                        onClick={() => handleCancelClick(booking)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your booking at {bookingToCancel?.gym.name} on{' '}
            {bookingToCancel && new Date(bookingToCancel.date).toLocaleDateString()}?
          </DialogContentText>
          {bookingToCancel && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>Time:</strong> {bookingToCancel.startTime} - {bookingToCancel.endTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Amount:</strong> ₹{bookingToCancel.amountPaid}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="primary">
            Keep Booking
          </Button>
          <Button onClick={handleConfirmCancel} color="secondary" variant="contained">
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookingsPage;
