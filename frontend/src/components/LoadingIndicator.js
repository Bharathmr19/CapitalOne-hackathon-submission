import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      width: '100%'
    }}>
      <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
      <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;
