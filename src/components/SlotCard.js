import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';

const SlotCard = ({ slot = {}, onSelect }) => {
  // Safe destructuring with defaults
  const {
    startTime = '',
    endTime = '',
    trainer = 'No trainer assigned',
    price = 0,
    gym = {}
  } = slot;

  // Safely handle gym name
  const gymName = gym?.name || 'Unknown Gym';

  // Safely format time display
  const formatTime = (time) => {
    if (!time || typeof time !== 'string') return '--:--';
    return time.slice(0, 5); // Only take HH:MM part
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h3">
          {gymName}
        </Typography>
        
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Time: {formatTime(startTime)} - {formatTime(endTime)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trainer: {trainer}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mt: 1 }}>
          ₹{price.toFixed(2)}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onSelect}
          disabled={!onSelect}
        >
          Book Slot
        </Button>
      </Box>
    </Card>
  );
};

export default SlotCard;