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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button
} from '@mui/material';
import { registerUser } from '../utils/api';
import { login } from '../utils/auth';
import Alert from '@mui/material/Alert';
import GoogleIcon from '../assets/google-icon.png';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const RegisterPage = () => {
  const history = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    birthDate: null,
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin, facebookLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'acceptTerms' ? checked : value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      birthDate: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        birthDate: formData.birthDate
      };

      const response = await registerUser(userData);
      login(response.data.token, response.data.user);
      history('/gyms');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await googleLogin();
      history('/gyms');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      await facebookLogin();
      history('/gyms');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        py: 4
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 4 }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Create Your Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Join thousands of fitness enthusiasts
        </Typography>

        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth id="name" label="Full Name" name="name"
                autoComplete="name" value={formData.name} onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth id="email" label="Email Address" name="email"
                autoComplete="email" type="email" value={formData.email} onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth name="password" label="Password" type="password"
                id="password" autoComplete="new-password" value={formData.password} onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth name="confirmPassword" label="Confirm Password" type="password"
                id="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth name="phone" label="Phone Number" type="tel"
                id="phone" autoComplete="tel" value={formData.phone} onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label" id="gender" name="gender"
                  value={formData.gender} onChange={handleChange} label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.birthDate}
                  onChange={handleDateChange}
                  disableFuture
                  renderInput={(params) => <TextField fullWidth sx={{ mb: 2 }} {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    name="acceptTerms"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    I agree to the{' '}
                    <Link to="/terms" style={{ color: '#1976d2', textDecoration: 'none' }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" style={{ color: '#1976d2', textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !formData.acceptTerms}
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </Box>

        <Divider sx={{ my: 3, color: 'text.secondary' }}>
          <Typography variant="body2" color="textSecondary">
            OR SIGN UP WITH
          </Typography>
        </Divider>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<img src={GoogleIcon} alt="Google" width={20} />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                mt: 1,
                mb: 1,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.9rem',
                backgroundColor: '#4285F4',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#357ABD'
                }
              }}
            >
              Google
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookLogin}
              disabled={loading}
              sx={{
                mt: 1,
                mb: 1,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.9rem',
                backgroundColor: '#3B5998',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2D4373'
                }
              }}
            >
              Facebook
            </Button>
          </Grid>
        </Grid>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
              Log in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;