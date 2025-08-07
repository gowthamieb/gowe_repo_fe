import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import {
  Menu as MenuIcon,
  FitnessCenter,
  AccountCircle,
  Notifications,
  Bookmark,
  ExitToApp,
  Home,
  Search,
  CalendarToday
} from '@mui/icons-material';
import { logout } from '../utils/auth';
import { isAuthenticated, getUser } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = getUser();
  const isAuth = isAuthenticated();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const navItems = [
    { text: 'Home', icon: <Home />, path: '/', auth: false },
    { text: 'Browse Gyms', icon: <Search />, path: '/gyms', auth: false },
    { text: 'My Bookings', icon: <CalendarToday />, path: '/my-bookings', auth: true },
  ];

  const userMenuItems = [
    { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
    { text: 'Saved Gyms', icon: <Bookmark />, path: '/saved' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
    { text: 'Logout', icon: <ExitToApp />, onClick: handleLogout },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <FitnessCenter fontSize="large" sx={{ mr: 1 }} />
        <Typography variant="h6">GymSlot</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          (!item.auth || isAuth) && (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          )
        ))}
      </List>
      {isAuth && (
        <>
          <Divider />
          <List>
            {userMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={item.onClick ? 'div' : Link}
                to={item.path}
                onClick={item.onClick || handleDrawerToggle}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            <FitnessCenter
              fontSize="large"
              sx={{ mr: 1, color: 'primary.main' }}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" color="inherit">
                GymSlot
              </Typography>
            </Box>
          </Link>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              (!item.auth || isAuth) && (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    ml: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  {item.text}
                </Button>
              )
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuth ? (
              <>
                <IconButton sx={{ mr: 2 }} color="inherit" size="large">
                  <Badge badgeContent={3} color="secondary">
                    <Notifications />
                  </Badge>
                </IconButton>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                  size="large"
                >
                  <Avatar
                    alt={user?.name}
                    src={user?.avatar}
                    sx={{ width: 32, height: 32, ml: 2 }}
                  />
                </IconButton>
                <Menu
                  id="user-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  keepMounted
                >
                  <MenuItem disabled>
                    <Typography variant="subtitle2">Signed in as</Typography>
                  </MenuItem>
                  <MenuItem disabled>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{ maxWidth: 200 }}
                    >
                      {user?.name || user?.email}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.text}
                      onClick={item.onClick || handleMenuClose}
                      component={item.onClick ? 'div' : Link}
                      to={item.path}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{ ml: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Login
                </Button>
                {/* <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/register"
                  sx={{ ml: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Sign Up
                </Button> */}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    ml: 2,
                    boxShadow: 'none',
                    zIndex: 1,
                    position: 'relative'
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
            <Box sx={{ display: { xs: 'block', md: 'none' }, ml: 1 }}>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better open performance on mobile
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

export default Navbar;
