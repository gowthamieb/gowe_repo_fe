import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: 'Roboto, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
    },
  },
  hidePostalCode: true,
};

const InnerPaymentForm = ({ clientSecret, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe not ready.');
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement }
      });

      if (error) {
        console.error('Stripe error:', error);
        onError(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        onError('Payment was not successful. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected payment error:', err);
      onError('Payment failed due to a system error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 5,
        mb: 5,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}
        >
          Enter Payment Details
        </Typography>

        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 2,
            p: 2,
            mb: 3,
            backgroundColor: '#fafafa',
            '&:focus-within': {
              borderColor: '#3f51b5',
            },
          }}
        >
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            id="card-element"
            aria-label="Card payment input"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          color="primary"
          sx={{
            height: 48,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,
            '&:hover': {
              backgroundColor: '#2c3eaf',
            },
          }}
          disabled={!stripe || processing}
        >
          {processing ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <CircularProgress size={24} color="inherit" />
              <Typography sx={{ ml: 1 }}>Processing...</Typography>
            </Box>
          ) : (
            `Pay ₹${amount.toFixed(2)}`
          )}
        </Button>
      </Paper>
    </Box>
  );
};

const PaymentForm = ({ clientSecret, amount, onSuccess, onError }) => (
  <Elements stripe={stripePromise} options={{ clientSecret }}>
    <InnerPaymentForm
      clientSecret={clientSecret}
      amount={amount}
      onSuccess={onSuccess}
      onError={onError}
    />
  </Elements>
);

export default PaymentForm;
