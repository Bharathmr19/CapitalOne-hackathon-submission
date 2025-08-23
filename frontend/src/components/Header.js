import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  LocalHospital as CropDoctorIcon,
  WbSunny as WeatherIcon,
  TrendingUp as MarketIcon,
  ReceiptLong as SchemeIcon,
  BarChart as ProfitIcon
} from '@mui/icons-material';
import logo from '../assets/logo.png';

const navigationItems = [
  { name: 'Crop Doctor', path: '/crop-doctor', icon: <CropDoctorIcon /> },
  { name: 'Weather & Irrigation', path: '/weather-irrigation', icon: <WeatherIcon /> },
  { name: 'Market Analysis', path: '/smart-market', icon: <MarketIcon /> },
  { name: 'Govt. Schemes', path: '/govt-schemes', icon: <SchemeIcon /> },
  { name: 'Profit Prediction', path: '/crop-profit', icon: <ProfitIcon /> },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h6" component="div">AgriSage</Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path} 
            key={item.name}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                }
              }
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'white' }}>
        <Container>
          <Toolbar sx={{ justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img src={logo} alt="AgriSage Logo" className="app-logo" />
                <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 600, color: '#4CAF50' }}>
                  AgriSage
                </Typography>
              </Link>
            </Box>
            
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex' }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.name}
                    component={Link}
                    to={item.path}
                    sx={{ 
                      mx: 1,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      fontWeight: location.pathname === item.path ? '500' : '400',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Header;
