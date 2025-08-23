import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  TextField, 
  MenuItem,
  Divider,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Remove as RemoveIcon,
  LocationOn as LocationOnIcon,
  MonetizationOn as MonetizationOnIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';
import { getMarketAnalysis } from '../services/api';

const regions = [
  'Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana',
  'Uttar Pradesh', 'Bihar', 'West Bengal', 'Assam', 'Odisha'
];

const crops = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 
  'Groundnut', 'Soybean', 'Mustard', 'Potato', 'Tomato',
  'Onion', 'Chili', 'Turmeric', 'Banana', 'Mango'
];

const SmartMarket = () => {
  const [formData, setFormData] = useState({
    crop_name: '',
    region: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const theme = useTheme();
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.crop_name || !formData.region) {
      toast.error('Please select both crop and region');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMarketAnalysis(formData.crop_name, formData.region);
      setResult(data);
      
      toast.success('Market analysis loaded');
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err);
      toast.error('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({ crop_name: '', region: '' });
    setResult(null);
    setError(null);
  };
  
  // Helper to get trend icon
  const getTrendIcon = (trend) => {
    if (!trend) return <RemoveIcon />;
    const lowerTrend = trend.toLowerCase();
    
    if (lowerTrend.includes('increas') || lowerTrend.includes('up') || lowerTrend.includes('rise')) {
      return <TrendingUpIcon color="success" />;
    } else if (lowerTrend.includes('decreas') || lowerTrend.includes('down') || lowerTrend.includes('fall')) {
      return <TrendingDownIcon color="error" />;
    }
    return <RemoveIcon color="info" />;
  };
  
  // Helper to get action color and icon
  const getActionInfo = (action) => {
    if (!action) return { color: 'default', icon: <RemoveIcon /> };
    
    switch(action.toLowerCase()) {
      case 'buy':
        return { color: 'success', icon: <ArrowDownwardIcon /> };
      case 'sell':
        return { color: 'error', icon: <ArrowUpwardIcon /> };
      case 'hold':
        return { color: 'warning', icon: <RemoveIcon /> };
      default:
        return { color: 'default', icon: <RemoveIcon /> };
    }
  };
  
  return (
    <Box component="main">
      <PageHeader
        title="Market Analysis"
        description="Get real-time market insights, price trends, and selling recommendations"
        backgroundImage="https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
        icon={<TrendingUpIcon fontSize="large" />}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Get Market Analysis
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <TextField
                    select
                    fullWidth
                    label="Select Crop"
                    name="crop_name"
                    value={formData.crop_name}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                  >
                    {crops.map((crop) => (
                      <MenuItem key={crop} value={crop}>
                        {crop}
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <TextField
                    select
                    fullWidth
                    label="Select Region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                  >
                    {regions.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={resetForm}
                      disabled={loading}
                      sx={{ flex: 1 }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !formData.crop_name || !formData.region}
                      sx={{ flex: 1 }}
                    >
                      Analyze
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
            
            {result && (
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                    Recommended Action
                  </Typography>
                  
                  {result.recommended_action ? (
                    <>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Chip 
                          label={result.recommended_action}
                          color={getActionInfo(result.recommended_action).color}
                          icon={getActionInfo(result.recommended_action).icon}
                          sx={{ 
                            fontSize: '1.2rem', 
                            py: 3, 
                            px: 3, 
                            fontWeight: 'bold'
                          }}
                        />
                        
                        {result.confidence && (
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Confidence: {Math.round(result.confidence * 100)}%
                          </Typography>
                        )}
                      </Box>
                      
                      {result.alternate_markets && result.alternate_markets.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Alternative Markets
                          </Typography>
                          <List dense>
                            {result.alternate_markets.map((market, index) => (
                              <ListItem key={index} disableGutters>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <LocationOnIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={market} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography color="textSecondary" align="center">
                      No specific recommendation available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            {loading && <LoadingIndicator message="Analyzing market trends..." />}
            
            {error && <ErrorDisplay error={error} resetError={resetForm} />}
            
            {result && !loading && (
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Market Analysis for {result.crop_name} in {result.region}
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'background.default' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <MonetizationOnIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="h6" component="h3">
                            Current Price Information
                          </Typography>
                        </Box>
                        
                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Current Price Range
                              </Typography>
                              <Typography variant="h6" fontWeight="medium">
                                {result.trend_info.current_price_range || 'Not available'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Last Updated
                              </Typography>
                              <Typography variant="body1">
                                {result.trend_info.last_updated || 'Not available'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Trend Direction
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getTrendIcon(result.trend_info.trend_direction)}
                                <Typography variant="body1" sx={{ ml: 1 }}>
                                  {result.trend_info.trend_direction || 'Not available'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Month-over-Month Change
                              </Typography>
                              <Typography variant="body1">
                                {result.trend_info.month_over_month_change_percent || 'Not available'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Supply Status
                            </Typography>
                            <Typography variant="body1">
                              {result.trend_info.supply_status || 'Not available'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Demand Status
                            </Typography>
                            <Typography variant="body1">
                              {result.trend_info.demand_status || 'Not available'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Market Yard
                            </Typography>
                            <Typography variant="body1">
                              {result.trend_info.market_yard || 'Not available'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {result.rationale && (
                  <Card sx={{ mb: 4 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimelineIcon sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6" component="h3">
                          Analysis Rationale
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {result.rationale}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
                
                {result.notes && (
                  <Card sx={{ mb: 4 }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        Additional Notes
                      </Typography>
                      <Typography variant="body1">
                        {result.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
                
                <Typography variant="caption" color="textSecondary">
                  Sources: {result.sources.join(", ")}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SmartMarket;
