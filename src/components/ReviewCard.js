import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  IconButton,
  Button
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const ReviewCard = ({ review, showActions = true }) => {
  const theme = useTheme();

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarIcon key={i} sx={{ color: theme.palette.warning.main }} />
        ) : (
          <StarBorderIcon key={i} sx={{ color: theme.palette.text.disabled }} />
        )
      );
    }
    return stars;
  };

  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Avatar
            alt={review.user.name}
            src={review.user.avatar}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {review.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {format(new Date(review.date), 'MMMM d, yyyy')}
            </Typography>
          </Box>
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {renderStars(review.rating)}
        </Box>

        <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
          {review.comment}
        </Typography>

        {review.response && (
          <Box
            sx={{
              mt: 2,
              pl: 2,
              borderLeft: `3px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Owner&apos;s Response
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {review.response}
            </Typography>
          </Box>
        )}

        {showActions && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" color="primary" sx={{ mr: 1, textTransform: 'none' }}>
                Helpful ({review.helpfulCount || 0})
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
