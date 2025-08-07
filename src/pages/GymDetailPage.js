import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Tab,
  Tabs,
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  People,
  FitnessCenter,
  Wifi,
  LocalParking,
  Pool,
  Share,
  Favorite,
  FavoriteBorder,
  ArrowBack,
} from '@mui/icons-material';
import { getGymById, getSlots, createBooking } from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SlotCard from '../components/SlotCard';
import ReviewCard from '../components/ReviewCard';
import MapComponent from '../components/MapComponent';
import Rating from '@mui/material/Rating';
import SlotGrid from '../components/SlotGrid';
import PaymentForm from '../components/PaymentForm';

const formatAddress = (address) => {
  if (!address) return 'N/A';
  const { street, city, state, postalCode, country } = address;
  return [street, city, state, postalCode, country].filter(Boolean).join(', ');
};

const GymDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingGym, setLoadingGym] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [paymentPageOpen, setPaymentPageOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch gym data when component mounts
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        setError(null);
        setLoadingGym(true);
        const { data } = await getGymById(id);
        setGym(data);
      } catch (err) {
        setError('Failed to load gym details');
      } finally {
        setLoadingGym(false);
      }
    };
    fetchGymData();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!gym?._id || !selectedDate) {
        setSlots([]); // Clear slots if no gym or date selected
        return;
      }
  
      try {
        setLoadingSlots(true);
        setError(null);
  
        const formattedDate = selectedDate.toISOString().split('T')[0]; // Ensure it's defined here
        const response = await getSlots(gym._id, formattedDate);
  
        setSlots(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError('Failed to load available slots');
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
  
    fetchSlots();
  }, [gym?._id, selectedDate]);

  
  // useEffect(() => {
  //   const fetchSlots = async () => {
  //     if (!gym?._id || !selectedDate) {
  //       setSlots([]); // Clear slots if gym or date is missing
  //       return;
  //     }
  
  //     try {
  //       setLoadingSlots(true);
  //       setError(null);
  
  //       // Format date as YYYY-MM-DD
  //       // const formattedDate = selectedDate instanceof Date
  //       //   ? selectedDate.toISOString().split('T')[0]
  //       //   : new Date(selectedDate).toISOString().split('T')[0];
  
  //       console.log('Fetching slots for:', gym._id, 'on', formattedDate);
  
  //       // Fetch slots with date
  //       const formattedDate = selectedDate.toISOString().split('T')[0];
  //       const response = await getSlots(gym._id, formattedDate);
  
  //       if (Array.isArray(response)) {
  //         setSlots(response);
  //       } else {
  //         console.warn('Unexpected response for slots:', response);
  //         setSlots([]);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching slots:', err.response?.data || err.message);
  //       setError('Failed to load available slots');
  //       setSlots([]);
  //     } finally {
  //       setLoadingSlots(false);
  //     }
  //   };
  
  //   fetchSlots();
  // }, [gym?._id, selectedDate]);
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTabChange = (_, newValue) => setTabValue(newValue);

  const handleSlotSelect_bk = (slot) => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    setSelectedSlot(slot);
    setOpenBookingDialog(true);
  };

  const handleSlotSelect = (slot) => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    navigate(`/book/${slot._id}`, { state: { slot, date: selectedDate, gym } });
  };

  const handleBookSlot = () => {
    setPaymentPageOpen(true);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentPageOpen(false);
    setOpenBookingDialog(false);
    
    const createBookingRecord = async () => {
      try {
        await createBooking({
          slotId: selectedSlot._id,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100
        });
        navigate('/my-bookings');
      } catch (err) {
        setError('Failed to create booking record');
      }
    };
    
    createBookingRecord();
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Book ${gym.name} on GymSlot`,
        text: `Check out ${gym.name} on GymSlot and book your workout session!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite((fav) => !fav);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const [hour, minute] = timeStr.split(':');
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loadingGym) {
    return (
      <Container sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !gym) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography color="error">{error || 'Gym not found'}</Typography>
      </Container>
    );
  }

  const ratingValue = typeof gym.rating === 'number' ? gym.rating : gym.rating?.average ?? 0;
  const reviewCount = gym.reviewCount ?? gym.rating?.count ?? 0;

  return (
    <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">{gym.name}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={toggleFavorite} color={isFavorite ? 'secondary' : 'default'}>
          {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
        <IconButton onClick={handleShare} sx={{ ml: 1 }}>
          <Share />
        </IconButton>
      </Box>

      {/* Gym Image */}
      <Box
        component="img"
        src={gym.images?.[0]?.url || 'https://via.placeholder.com/800x400'}
        alt={gym.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/800x400';
        }}
        sx={{
          width: '100%',
          height: 400,
          objectFit: 'cover',
          borderRadius: 1,
          mb: 3,
        }}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left side content */}
        <Grid item xs={12} md={8}>
          {/* About Section */}
          <Paper elevation={0} sx={{ mb: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              About This Gym
            </Typography>
            <Typography paragraph>{gym.description || 'No description available.'}</Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Facilities
            </Typography>
            <Box>
              {gym.facilities?.map((facility) => (
                <Chip
                  key={facility}
                  icon={getFacilityIcon(facility)}
                  label={facility}
                  sx={{ m: 0.5 }}
                />
              )) || <Typography>No facilities listed</Typography>}
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper elevation={0} sx={{ mb: 4, p: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Slots" />
              <Tab label="Reviews" />
              <Tab label="Location" />
            </Tabs>

            <Box sx={{ py: 2 }}>
              {tabValue === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Available Slots
                  </Typography>

                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    className="custom-datepicker"
                    dateFormat="MMMM d, yyyy"
                    wrapperClassName="date-picker-wrapper"
                  />

                  {loadingSlots ? (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <SlotGrid 
                      slots={slots} 
                      loadingSlots={loadingSlots}
                      handleSlotSelect={handleSlotSelect} 
                      selectedDate={selectedDate}
                      error={error} // Pass error state
                    />
                  )}
                </>
              )}

              {tabValue === 1 && (
                <>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Rating value={ratingValue} precision={0.5} readOnly size="large" />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {ratingValue > 0 ? ratingValue.toFixed(1) : 'No'} rating ({reviewCount} reviews)
                    </Typography>
                  </Box>

                  {gym.reviews?.length > 0 ? (
                    gym.reviews.map((review) => <ReviewCard key={review._id} review={review} />)
                  ) : (
                    <Typography>No reviews yet</Typography>
                  )}
                </>
              )}

              {tabValue === 2 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Location
                  </Typography>
                  <Box mb={2}>
                    <Typography>
                      <LocationOn color="primary" sx={{ verticalAlign: 'middle' }} />{' '}
                      {formatAddress(gym.address)}
                    </Typography>
                  </Box>
                  <MapComponent lat={gym.location?.lat || 0} lng={gym.location?.lng || 0} name={gym.name} />
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right side info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ mb: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gym Information
            </Typography>

            <Box mb={2}>
              <Typography>
                <Schedule color="primary" sx={{ verticalAlign: 'middle' }} /> 
                <strong>Weekdays:</strong> {formatTime(gym.openingHours?.weekdays?.open)} - {formatTime(gym.openingHours?.weekdays?.close)}<br />
                <Schedule color="primary" sx={{ verticalAlign: 'middle', visibility: 'hidden' }} />
                <strong>Weekends:</strong> {formatTime(gym.openingHours?.weekends?.open)} - {formatTime(gym.openingHours?.weekends?.close)}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography>
                <People color="primary" sx={{ verticalAlign: 'middle' }} /> Capacity: {gym.capacity || 'N/A'}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography>
                <FitnessCenter color="primary" sx={{ verticalAlign: 'middle' }} /> Trainer Available: {gym.hasTrainers ? 'Yes' : 'No'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Pricing
            </Typography>
            <Typography paragraph>Standard Slot: INR{gym.pricing?.standard ?? 'N/A'}</Typography>
            <Typography paragraph>Premium Slot: INR{gym.pricing?.premium ?? 'N/A'}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>
            <Typography paragraph>Phone: {gym.phone || 'N/A'}</Typography>
            <Typography paragraph>Email: {gym.email || 'N/A'}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog 
        open={openBookingDialog} 
        onClose={() => setOpenBookingDialog(false)} 
        maxWidth="sm"
        fullWidth
      >
        {paymentPageOpen ? (
          <PaymentForm
            amount={selectedSlot?.price}
            slotId={selectedSlot?._id}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={() => {
              setPaymentPageOpen(false);
              setOpenBookingDialog(false);
            }}
          />
        ) : (
          <>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogContent dividers>
              {selectedSlot && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Date:</strong> {selectedDate.toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Price:</strong> ₹{selectedSlot.price}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenBookingDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleBookSlot} 
                variant="contained" 
                color="primary"
                disabled={!selectedSlot}
              >
                Continue to Payment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

const getFacilityIcon = (facility) => {
  switch (facility.toLowerCase()) {
    case 'wifi':
      return <Wifi />;
    case 'parking':
      return <LocalParking />;
    case 'pool':
      return <Pool />;
    default:
      return <FitnessCenter />;
  }
};

export default GymDetailPage;