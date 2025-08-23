import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';

const PageHeader = ({ title, description, backgroundImage, icon }) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        position: 'relative',
        height: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        borderRadius: 0,
        mb: 4,
        overflow: 'hidden',
        background: backgroundImage 
          ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`
          : `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      elevation={0}
    >
      <Box sx={{ 
        position: 'relative', 
        zIndex: 2,
        textAlign: 'center',
        p: 3,
        maxWidth: '800px'
      }}>
        {icon && (
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            mb: 2
          }}>
            {icon}
          </Box>
        )}
        <Typography variant="h3" component="h1" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="h6" component="div">
            {description}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default PageHeader;
