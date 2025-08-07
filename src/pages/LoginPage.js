import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Typography,
  Container,
  Paper,
  Box,
  Grid,
  Divider,
  Button,
  Alert
} from '@mui/material';
import GoogleIcon from '../assets/google-icon.png';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../utils/api';
import { login } from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin, facebookLogin } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginUser(formData);
      login(response.data.token, response.data.user);
      navigate('/gyms');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      navigate('/gyms');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      await facebookLogin();
      navigate('/gyms');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        p: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          borderRadius: (theme) => theme.shape.borderRadius * 2,
        }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Log in to book your next gym session
        </Typography>

        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Box textAlign="right" mt={1}>
            <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'none', fontWeight: '500' }}>
              Forgot password?
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </Box>

        <Divider sx={{ my: 3, color: 'text.secondary' }}>
          <Typography variant="body2" color="text.secondary">
            OR CONTINUE WITH
          </Typography>
        </Divider>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#4285F4',
                color: 'white',
                '&:hover': { backgroundColor: '#357ABD' },
                textTransform: 'none',
                py: 1.5,
                fontSize: '0.9rem',
              }}
              startIcon={<img src={GoogleIcon} alt="Google" width={20} />}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Google
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#3B5998',
                color: 'white',
                '&:hover': { backgroundColor: '#2D4373' },
                textTransform: 'none',
                py: 1.5,
                fontSize: '0.9rem',
              }}
              startIcon={<FacebookIcon />}
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              Facebook
            </Button>
          </Grid>
        </Grid>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'inherit', textDecoration: 'none', fontWeight: '500' }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
