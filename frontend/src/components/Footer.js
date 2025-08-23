import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box sx={{ bgcolor: '#333', color: 'white', py: 6, mt: 'auto' }}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              AgriSage
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              A comprehensive agricultural assistant platform powered by AI to help farmers make informed decisions, diagnose crop diseases, monitor weather, track markets, and optimize profits.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton color="inherit" aria-label="Facebook" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Services
            </Typography>
            <Link href="/crop-doctor" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>
              Crop Doctor
            </Link>
            <Link href="/weather-irrigation" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>
              Weather & Irrigation
            </Link>
            <Link href="/smart-market" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>
              Market Analysis
            </Link>
            <Link href="/govt-schemes" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>
              Govt. Schemes
            </Link>
            <Link href="/crop-profit" color="inherit" display="block" underline="hover">
              Profit Prediction
            </Link>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Resources
            </Typography>
            <Link href="#" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>
              Blog
            </Link>
            <Link href="#" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>
              Knowledge Base
            </Link>
            <Link href="#" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>
              Tutorials
            </Link>
            <Link href="#" color="inherit" display="block" underline="hover">
              Case Studies
            </Link>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Email: info@agrisage.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Phone: +91 9876543210
            </Typography>
            <Typography variant="body2">
              Address: Innovation Center, Agricultural University Campus, Bangalore, India
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            &copy; {currentYear} AgriSage. All rights reserved. Developed for Capital One Hackathon
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
