import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Button
} from '@mui/material';
import { getGyms } from '../utils/api';

const fallbackGymImage = 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?auto=format&fit=crop&w=800&q=80';

const GymListPage = () => {
  const [gyms, setGyms] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useNavigate();

  const handleSearch = async (searchValue) => {
    try {
      setLoading(true);
      const { data } = await getGyms(searchValue);
      setGyms(data);
    } catch (err) {
      console.error('Failed to fetch gyms:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 🔁 Debounced auto-search on location change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(location);
    }, 400); // 400ms debounce delay
  
    return () => clearTimeout(delayDebounce);
  }, [location]);

  useEffect(() => {
    // Load all gyms on first render
    const fetchAllGyms = async () => {
      try {
        setLoading(true);
        const { data } = await getGyms(''); // Pass empty string for all
        setGyms(data);
      } catch (err) {
        console.error('Failed to fetch gyms:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllGyms();
  }, []);

  return (
    <div style={{ padding: 20, paddingTop: 100 }}> {/* Added paddingTop */}
      <Grid container spacing={3} alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          label="Search by location"
          variant="outlined"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        </Grid>
        <Grid item xs={12} sm={4}>
        <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <CircularProgress />
        </div>
      ) : (
        <Grid container spacing={3}>
          {gyms.map((gym) => (
            <Grid item xs={12} sm={6} md={4} key={gym._id}>
              <Card
                onClick={() => history(`/gyms/${gym._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={
                    gym.images?.find(img => img.isFeatured)?.url ||
                    gym.images?.[0]?.url ||
                    fallbackGymImage
                  }
                  alt={gym.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackGymImage;
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {gym.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {gym.address?.street}, {gym.address?.city}, {gym.address?.country}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {gym.facilities?.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>

  );
};

export default GymListPage;
