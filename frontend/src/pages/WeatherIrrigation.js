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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  WbSunny as WbSunnyIcon,
  WaterDrop as WaterIcon,
  Warning as WarningIcon,
  Opacity as OpacityIcon,
  Thermostat as ThermostatIcon,
  Air as AirIcon,
  Cloud as CloudIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';
import { getWeatherIrrigationAdvice } from '../services/api';

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

const WeatherCard = ({ title, value, icon, color }) => {
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: `${color}.light`,
        bgcolor: `${color}.light`,
        p: 1
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Typography color="textSecondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          p: 2, 
          bgcolor: `${color}.main`, 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
};

const WeatherIrrigation = () => {
  const [formData, setFormData] = useState({
    crop: '',
    region: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!formData.crop || !formData.region) {
      toast.error('Please select both crop and region');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getWeatherIrrigationAdvice(formData.crop, formData.region);
      setResult(data);
      
      toast.success('Weather and irrigation data loaded');
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err);
      toast.error('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({ crop: '', region: '' });
    setResult(null);
    setError(null);
  };
  
  return (
    <Box component="main">
      <PageHeader
        title="Weather & Irrigation"
        description="Get personalized weather forecasts and irrigation recommendations"
        backgroundImage="https://images.unsplash.com/photo-1464685308977-52a1969ba3dc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
        icon={<WbSunnyIcon fontSize="large" />}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Generate Weather & Irrigation Advice
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <TextField
                    select
                    fullWidth
                    label="Select Crop"
                    name="crop"
                    value={formData.crop}
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
                      disabled={loading || !formData.crop || !formData.region}
                      sx={{ flex: 1 }}
                    >
                      Generate
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
            
            {result && (
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Agricultural Metrics
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Soil Moisture Trend
                    </Typography>
                    <Typography variant="body1">
                      {result.weather_data.agricultural_metrics.soil_moisture_trend}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Evaporation Rate
                    </Typography>
                    <Typography variant="body1">
                      {result.weather_data.agricultural_metrics.evaporation_rate}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Drought Risk
                    </Typography>
                    <Typography variant="body1">
                      {result.weather_data.agricultural_metrics.drought_risk}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Pest Risk
                    </Typography>
                    <Typography variant="body1">
                      {result.weather_data.agricultural_metrics.pest_risk}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            {loading && <LoadingIndicator message="Generating weather and irrigation advice..." />}
            
            {error && <ErrorDisplay error={error} resetError={resetForm} />}
            
            {result && !loading && (
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {result.crop_name} in {result.region}
                </Typography>
                
                {/* Current Weather */}
                <Typography variant="h6" component="h3" sx={{ mb: 2, mt: 4 }}>
                  Current Weather Conditions
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <WeatherCard 
                      title="Temperature" 
                      value={result.weather_data.current_conditions.temperature}
                      icon={<ThermostatIcon sx={{ color: 'white' }} />}
                      color="error"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <WeatherCard 
                      title="Humidity" 
                      value={result.weather_data.current_conditions.humidity}
                      icon={<OpacityIcon sx={{ color: 'white' }} />}
                      color="info"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <WeatherCard 
                      title="Wind Speed" 
                      value={result.weather_data.current_conditions.wind_speed}
                      icon={<AirIcon sx={{ color: 'white' }} />}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <WeatherCard 
                      title="Rainfall (24h)" 
                      value={result.weather_data.current_conditions.rainfall_last_24h}
                      icon={<CloudIcon sx={{ color: 'white' }} />}
                      color="secondary"
                    />
                  </Grid>
                </Grid>
                
                {/* Daily Forecast */}
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  7-Day Forecast
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Conditions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.weather_data.daily_forecast.length > 0 ? (
                        result.weather_data.daily_forecast.map((day, index) => (
                          <TableRow key={index}>
                            <TableCell>{day.date}</TableCell>
                            <TableCell>{day.conditions}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            No forecast data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Irrigation Schedule */}
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Irrigation Schedule
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Timing</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.irrigation_schedule.map((schedule, index) => (
                        <TableRow key={index}>
                          <TableCell>{schedule.day}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <WaterIcon sx={{ color: 'primary.main', mr: 1, fontSize: 'small' }} />
                              {schedule.action}
                            </Box>
                          </TableCell>
                          <TableCell>{schedule.timing}</TableCell>
                          <TableCell>{schedule.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Risk Alerts */}
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Risk Alerts & Protective Measures
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: 'error.light', height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WarningIcon sx={{ color: 'error.main', mr: 1 }} />
                          <Typography variant="h6" component="div">
                            Risk Alerts
                          </Typography>
                        </Box>
                        <Box component="ul" sx={{ pl: 2 }}>
                          {result.risk_alerts.map((alert, index) => (
                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                              {alert}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: 'success.light', height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WaterIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="h6" component="div">
                            Protective Measures
                          </Typography>
                        </Box>
                        <Box component="ul" sx={{ pl: 2 }}>
                          {result.protective_measures.map((measure, index) => (
                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                              {measure}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* Conservation Tips */}
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Water Conservation Tips
                </Typography>
                <Card sx={{ mb: 4, bgcolor: 'info.light' }}>
                  <CardContent>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {result.water_conservation_tips.map((tip, index) => (
                        <Typography component="li" key={index} sx={{ mb: 1 }}>
                          {tip}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Notes */}
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Additional Notes
                </Typography>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography>
                      {result.notes}
                    </Typography>
                  </CardContent>
                </Card>
                
                {result.warning && (
                  <Card sx={{ bgcolor: 'warning.light', mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography fontWeight="medium">
                          {result.warning}
                        </Typography>
                      </Box>
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

export default WeatherIrrigation;
