import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Container, 
  Grid, 
  Paper,
  Box,
  Button
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FitnessCenterIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
      title: "Wide Selection",
      description: "Choose from hundreds of gyms with various facilities"
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
      title: "Flexible Booking",
      description: "Book slots 24/7 that fit your schedule perfectly"
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
      title: "Near You",
      description: "Find the best gyms in your neighborhood"
    }
  ];

  return (
    <Box sx={{ pt: { xs: 8, sm: 10 } }}> {/* Top padding to offset fixed AppBar */}
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          py: 8,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Book Your Perfect Workout
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            Discover and reserve gym slots in your area with just a few clicks
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 4, px: 4, py: 2, fontSize: '1.1rem' }}
            onClick={() => navigate('/gyms')}
          >
            Browse Gyms Nearby
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {feature.icon}
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials/Stats Section */}
      <Box mt={8} mb={6} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Join Thousands of Fitness Enthusiasts
        </Typography>
        <Grid container justifyContent="center" spacing={6}>
          <Grid item>
            <Typography variant="h3" color="primary.main">
              10,000+
            </Typography>
            <Typography variant="subtitle1">
              Active Users
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h3" color="primary.main">
              500+
            </Typography>
            <Typography variant="subtitle1">
              Partner Gyms
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h3" color="primary.main">
              50,000+
            </Typography>
            <Typography variant="subtitle1">
              Monthly Bookings
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Final CTA */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h5" gutterBottom>
          Ready to start your fitness journey?
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 4, px: 4, py: 2, fontSize: '1.1rem' }}
          onClick={() => navigate('/register')}
        >
          Sign Up Now
        </Button>
      </Box>
    </Box>

  );
};

export default HomePage;
