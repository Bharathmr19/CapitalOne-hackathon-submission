import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Stack
} from '@mui/material';
import { 
  LocalHospital as CropDoctorIcon,
  WbSunny as WeatherIcon, 
  TrendingUp as MarketIcon,
  ReceiptLong as SchemeIcon,
  BarChart as ProfitIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Home = () => {
  const services = [
    {
      title: 'Crop Doctor',
      description: 'Diagnose crop diseases from images using advanced AI technology.',
      icon: <CropDoctorIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/crop-doctor',
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      title: 'Weather & Irrigation',
      description: 'Get personalized weather forecasts and smart irrigation schedules.',
      icon: <WeatherIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/weather-irrigation',
      image: 'https://images.unsplash.com/photo-1464685308977-52a1969ba3dc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      title: 'Market Analysis',
      description: 'Real-time market insights, price trends, and selling recommendations.',
      icon: <MarketIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/smart-market',
      image: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      title: 'Government Schemes',
      description: 'Discover and apply for relevant agricultural subsidy programs.',
      icon: <SchemeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/govt-schemes',
      image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1729&q=80'
    },
    {
      title: 'Profit Prediction',
      description: 'Calculate potential profits and analyze risks before planting.',
      icon: <ProfitIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/crop-profit',
      image: 'https://images.unsplash.com/photo-1565514020179-026b92b4a5b0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    }
  ];

  const features = [
    'AI-powered crop disease detection',
    'Region-specific weather forecasting',
    'Smart irrigation scheduling',
    'Real-time market price analysis',
    'Government scheme recommendations',
    'Profit prediction and risk assessment',
    'Personalized farming insights'
  ];
  
  return (
    <Box component="main">
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 12,
          pb: 12,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.2,
            backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="overline" sx={{ fontSize: '1rem', letterSpacing: 2 }}>
                  WELCOME TO
                </Typography>
                <Typography 
                  variant="h1" 
                  component="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 700,
                    mb: 2
                  }}
                >
                  AgriSage
                </Typography>
                <Typography 
                  variant="h5" 
                  component="p" 
                  sx={{ 
                    mb: 4,
                    maxWidth: '600px',
                    lineHeight: 1.6
                  }}
                >
                  Your comprehensive AI farming assistant for maximizing yields, minimizing risks, and making informed agricultural decisions.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    color="secondary"
                    component={RouterLink}
                    to="/crop-doctor"
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      borderRadius: '30px',
                      fontWeight: 600
                    }}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      borderRadius: '30px',
                      fontWeight: 600,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    component={RouterLink}
                    to="/smart-market"
                  >
                    Market Analysis
                  </Button>
                </Box>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={5}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  color: 'text.primary'
                }}
              >
                <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                  Key Features
                </Typography>
                <Stack spacing={2}>
                  {features.map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography>{feature}</Typography>
                    </Box>
                  ))}
                </Stack>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Services Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          align="center"
          sx={{ 
            mb: 1,
            fontWeight: 600
          }}
        >
          Our Services
        </Typography>
        <Typography 
          variant="h6" 
          component="p" 
          align="center"
          color="text.secondary"
          sx={{ 
            mb: 6,
            maxWidth: '700px',
            mx: 'auto'
          }}
        >
          Empowering farmers with AI-driven tools for smarter farming decisions.
        </Typography>
        
        <Grid container spacing={3}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ height: '100%' }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="service-card">
                  <CardMedia
                    component="img"
                    height="180"
                    image={service.image}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {service.icon}
                      <Typography variant="h6" component="h3" sx={{ ml: 1, fontWeight: 600 }}>
                        {service.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={RouterLink} 
                      to={service.path} 
                      size="small" 
                      endIcon={<motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>→</motion.div>}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* CTA Section */}
      <Box sx={{ bgcolor: 'secondary.light', py: 8, mt: 8 }}>
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h3" sx={{ mb: 2 }}>
                Ready to optimize your farming decisions?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Start using AgriSage today and gain access to AI-powered agricultural insights.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Button 
                component={RouterLink}
                to="/crop-doctor" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Get Started Now
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
