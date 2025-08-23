import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Warning, Error } from '@mui/icons-material';

const ErrorDisplay = ({ 
  error, 
  resetError = null, 
  severity = 'error' 
}) => {
  const isWarning = severity === 'warning';
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        backgroundColor: isWarning ? 'rgba(255, 193, 7, 0.08)' : 'rgba(211, 47, 47, 0.08)',
        borderRadius: 2,
        border: isWarning ? '1px solid rgba(255, 193, 7, 0.5)' : '1px solid rgba(211, 47, 47, 0.5)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        {isWarning 
          ? <Warning sx={{ fontSize: 60, color: 'warning.main' }} />
          : <Error sx={{ fontSize: 60, color: 'error.main' }} />
        }
      </Box>
      
      <Typography variant="h5" component="h2" gutterBottom sx={{ color: isWarning ? 'warning.dark' : 'error.dark' }}>
        {isWarning ? 'Warning' : 'Error Occurred'}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        {error?.detail || error?.message || String(error) || 'An unexpected error occurred. Please try again.'}
      </Typography>
      
      {resetError && (
        <Button 
          variant="outlined" 
          color={isWarning ? 'warning' : 'error'} 
          onClick={resetError}
        >
          Try Again
        </Button>
      )}
    </Paper>
  );
};

export default ErrorDisplay;
