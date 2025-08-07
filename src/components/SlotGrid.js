import React from 'react';
import { Grid, Box, Typography, CircularProgress, Alert } from '@mui/material';
import SlotCard from './SlotCard';

const SlotGrid = ({ slots = [], loadingSlots, handleSlotSelect, selectedDate, error }) => {
  // Safe filtering with proper error handling
  const filteredSlots = React.useMemo(() => {
    if (!selectedDate || !Array.isArray(slots)) return [];
    
    return slots.filter(slot => {
      try {
        if (!slot || !slot.date) return false;
        
        const slotDate = new Date(slot.date);
        return (
          slotDate.getFullYear() === selectedDate.getFullYear() &&
          slotDate.getMonth() === selectedDate.getMonth() &&
          slotDate.getDate() === selectedDate.getDate() &&
          slot.available !== false // Explicit check for available
        );
      } catch (e) {
        console.warn('Invalid slot data:', slot, e);
        return false;
      }
    });
  }, [slots, selectedDate]);

  // Loading state
  if (loadingSlots) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading available slots...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography sx={{ textAlign: 'center' }}>
          Please try again later
        </Typography>
      </Box>
    );
  }

  // No date selected state
  if (!selectedDate) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body1">
          Please select a date to view available slots
        </Typography>
      </Box>
    );
  }

  // Main render
  return (
    <Box sx={{ flexGrow: 1, px: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {selectedDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </Typography>
      
      <Grid container spacing={3}>
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot) => (
            <Grid item xs={12} sm={6} md={4} key={slot._id || slot.id || Math.random()}>
              <SlotCard
                slot={slot}
                onSelect={() => handleSlotSelect(slot)}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography sx={{ textAlign: 'center', mt: 3 }}>
              {slots.length === 0 
                ? 'No slots data available' 
                : 'No available slots for this date/time'}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SlotGrid;