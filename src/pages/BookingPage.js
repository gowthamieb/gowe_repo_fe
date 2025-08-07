import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSlotById, createPaymentIntent } from '../utils/api';
import { 
  Typography, 
  CircularProgress, 
  Button,
  Box,
  Paper,
  Container,
  Alert
} from '@mui/material';
import PaymentForm from '../components/PaymentForm';
import ArrowBack from '@mui/icons-material/ArrowBack';

const BookingPage = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { date, gym, slot: passedSlot } = location.state || {};

  const [slot, setSlot] = useState(passedSlot || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const initializeBooking = async () => {
      try {
        setLoading(true);
        setError(null);

        let slotData = passedSlot;

        // If no slot passed via state, fetch from backend
        if (!slotData) {
          const { data } = await getSlotById(slotId);
          slotData = data;
        }

        setSlot(slotData);

        const response = await createPaymentIntent(slotId, slotData.price);
        const { clientSecret, bookingId } = response.data || response;

        if (!clientSecret) throw new Error('Missing client secret');

        setPaymentData({
          clientSecret,
          bookingId,
          amount: slotData.price
        });
      } catch (err) {
        console.error('Booking initialization error:', err);
        setError(err.message || 'Failed to initialize booking');
      } finally {
        setLoading(false);
      }
    };

    initializeBooking();
  }, [slotId, passedSlot]);

  const handlePaymentSuccess = () => {
    navigate('/my-bookings', {
      state: {
        bookingSuccess: true,
        bookingId: paymentData.bookingId
      }
    });
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: '60vh', // Ensures vertical centering
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Preparing your booking...
        </Typography>
      </Container>
    );
  }
  

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Back to Available Slots
        </Button>
      </Container>
    );
  }

  if (!slot) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Slot not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    // <Container maxWidth="md" sx={{ py: 4 }}>
    //   <Button
    //     startIcon={<ArrowBack />}
    //     onClick={() => navigate(-1)}
    //     sx={{ mb: 3 }}
    //   >
    //     Back to gym
    //   </Button>

    //   <Paper elevation={3} sx={{ p: 4 }}>
    //     <Typography variant="h4" gutterBottom>
    //       Complete Your Booking
    //     </Typography>

    //     <Box sx={{ mb: 4 }}>
    //       <Typography variant="h6">
    //         {slot.gym?.name || gym?.name || 'Gym'}
    //       </Typography>
    //       <Typography>
    //         {new Date(slot.date).toLocaleDateString()} • {slot.startTime} - {slot.endTime}
    //       </Typography>
    //       <Typography variant="h5" sx={{ mt: 1 }}>
    //         Total: ₹{slot.price.toFixed(2)}
    //       </Typography>
    //     </Box>

    //     {paymentData ? (
    //       <PaymentForm
    //         clientSecret={paymentData.clientSecret}
    //         amount={paymentData.amount}
    //         onSuccess={handlePaymentSuccess}
    //         onError={(err) => setError(err.message)}
    //       />
    //     ) : (
    //       <Typography color="text.secondary">
    //         Finalizing payment details...
    //       </Typography>
    //     )}
    //   </Paper>
    // </Container>

    <Container maxWidth="md" sx={{ py: 4 }}>
  <Button
    startIcon={<ArrowBack />}
    onClick={() => navigate(-1)}
    sx={{ mb: 3 }}
  >
    Back to gym
  </Button>

  <Paper elevation={3} sx={{ p: 4 }}>
    <Typography variant="h4" gutterBottom>
      Complete Your Booking
    </Typography>

    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">
        {slot.gym?.name || gym?.name || 'Gym'}
      </Typography>
      <Typography>
        {new Date(slot.date).toLocaleDateString()} • {slot.startTime} - {slot.endTime}
      </Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>
        Total: ₹{slot.price.toFixed(2)}
      </Typography>
    </Box>

    {paymentData ? (
      <PaymentForm
        clientSecret={paymentData.clientSecret}
        amount={paymentData.amount}
        onSuccess={handlePaymentSuccess}
        onError={(err) => setError(err.message)}
      />
    ) : (
      <Typography color="text.secondary">
        Finalizing payment details...
      </Typography>
    )}
  </Paper>

  {/* Cancel Button Below */}
  <Box sx={{ mt: 3, textAlign: 'center' }}>
    <Button
      variant="outlined"
      color="error"
      onClick={() => navigate('/gyms')}
    >
      Cancel Booking
    </Button>
  </Box>
</Container>

  );
};

export default BookingPage;
