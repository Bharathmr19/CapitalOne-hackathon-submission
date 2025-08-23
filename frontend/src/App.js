import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import CropDoctor from './pages/CropDoctor';
import WeatherIrrigation from './pages/WeatherIrrigation';
import SmartMarket from './pages/SmartMarket';
import GovtSchemes from './pages/GovtSchemes';
import CropProfit from './pages/CropProfit';
import Layout from './components/Layout';
import './App.css';

// Custom theme with agricultural colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Green
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFA000', // Amber
      light: '#FFB74D',
      dark: '#FF8F00',
      contrastText: '#fff',
    },
    error: {
      main: '#D32F2F',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 600,
    },
    h2: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 500,
    },
    h4: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 500,
    },
    h5: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crop-doctor" element={<CropDoctor />} />
          <Route path="/weather-irrigation" element={<WeatherIrrigation />} />
          <Route path="/smart-market" element={<SmartMarket />} />
          <Route path="/govt-schemes" element={<GovtSchemes />} />
          <Route path="/crop-profit" element={<CropProfit />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
