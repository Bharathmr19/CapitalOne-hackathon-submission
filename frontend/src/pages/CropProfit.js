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
  InputAdornment,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  ShowChart as ShowChartIcon,
  ContentCopy as ContentCopyIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';
import { predictCropProfit } from '../services/api';

// Sample market price data - in a real app, this would come from an API
const marketData = {
  'Rice': { min: 18, max: 25 },
  'Wheat': { min: 19, max: 24 },
  'Maize': { min: 15, max: 21 },
  'Sugarcane': { min: 2.5, max: 3.5 },
  'Cotton': { min: 50, max: 60 },
  'Groundnut': { min: 45, max: 55 },
  'Soybean': { min: 35, max: 42 },
  'Mustard': { min: 40, max: 50 },
  'Potato': { min: 10, max: 15 },
  'Tomato': { min: 12, max: 30 },
  'Onion': { min: 15, max: 35 },
  'Chili': { min: 60, max: 100 },
  'Turmeric': { min: 65, max: 85 },
  'Banana': { min: 25, max: 40 },
  'Mango': { min: 40, max: 80 }
};

const cropOptions = Object.keys(marketData);

const CropProfit = () => {
  const [formData, setFormData] = useState({
    crop_name: '',
    land_area: '',
    cost_seeds: '',
    cost_fertilizer: '',
    cost_pesticides: '',
    cost_irrigation: '',
    cost_labor: '',
    cost_others: '',
    expected_yield: ''
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

  const calculateTotalCost = () => {
    const costs = [
      'cost_seeds',
      'cost_fertilizer',
      'cost_pesticides',
      'cost_irrigation',
      'cost_labor',
      'cost_others'
    ];
    
    return costs.reduce((total, costField) => {
      const value = parseFloat(formData[costField]) || 0;
      return total + value;
    }, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (!formData.crop_name || !formData.land_area || !formData.expected_yield) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const totalCost = calculateTotalCost();
      const payload = {
        ...formData,
        total_cost: totalCost,
      };
      
  const data = await predictCropProfit(payload);
      setResult(data);
      
      toast.success('Profit analysis completed');
    } catch (err) {
      console.error('Error analyzing profit:', err);
      setError(err);
      toast.error('Failed to analyze crop profitability');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      crop_name: '',
      land_area: '',
      cost_seeds: '',
      cost_fertilizer: '',
      cost_pesticides: '',
      cost_irrigation: '',
      cost_labor: '',
      cost_others: '',
      expected_yield: ''
    });
    setResult(null);
    setError(null);
  };
  
  const getCurrentMarketRate = () => {
    if (!formData.crop_name || !marketData[formData.crop_name]) return null;
    
    return marketData[formData.crop_name];
  };

  const copyResults = () => {
    if (!result) return;
    
    const textToCopy = `
    Profit Analysis for ${formData.crop_name}
    
    Land Area: ${formData.land_area} acres
    Expected Yield: ${formData.expected_yield} quintals
    
    Costs:
    Seeds: ₹${formData.cost_seeds}
    Fertilizer: ₹${formData.cost_fertilizer}
    Pesticides: ₹${formData.cost_pesticides}
    Irrigation: ₹${formData.cost_irrigation}
    Labor: ₹${formData.cost_labor}
    Others: ₹${formData.cost_others}
    Total Cost: ₹${calculateTotalCost()}
    
    Revenue: ₹${result.estimated_revenue}
    Profit: ₹${result.estimated_profit}
    ROI: ${result.roi}%
    
    Analysis: ${result.analysis}
    
    Risk Assessment: ${result.risk_assessment}
    `;
    
    navigator.clipboard.writeText(textToCopy);
    toast.info('Results copied to clipboard');
  };

  return (
    <Box component="main">
      <PageHeader
        title="Crop Profit Prediction"
        description="Calculate potential returns on your crop investments"
        backgroundImage="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1729&q=80"
        icon={<TrendingUpIcon fontSize="large" />}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Enter Crop Details
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
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
                        {cropOptions.map((crop) => (
                          <option key={crop} value={crop}>
                            {crop}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Land Area"
                        name="land_area"
                        value={formData.land_area}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">acres</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Expected Yield"
                        name="expected_yield"
                        value={formData.expected_yield}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">quintals</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Cost Breakdown
                      </Typography>
                      <Divider />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Seeds Cost"
                        name="cost_seeds"
                        value={formData.cost_seeds}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Fertilizer Cost"
                        name="cost_fertilizer"
                        value={formData.cost_fertilizer}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Pesticides Cost"
                        name="cost_pesticides"
                        value={formData.cost_pesticides}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Irrigation Cost"
                        name="cost_irrigation"
                        value={formData.cost_irrigation}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Labor Cost"
                        name="cost_labor"
                        value={formData.cost_labor}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Other Costs"
                        name="cost_others"
                        value={formData.cost_others}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      {formData.crop_name && getCurrentMarketRate() && (
                        <Paper sx={{ p: 2, bgcolor: 'background.default', mt: 2, mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Current Market Price (per quintal)
                          </Typography>
                          <Typography variant="body1">
                            ₹{getCurrentMarketRate().min} - ₹{getCurrentMarketRate().max}
                          </Typography>
                        </Paper>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
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
                          disabled={loading}
                          sx={{ flex: 1 }}
                        >
                          Calculate Profit
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={7}>
            {loading && <LoadingIndicator message="Analyzing crop profit potential..." />}
            
            {error && <ErrorDisplay error={error} resetError={resetForm} />}
            
            {result && !loading && (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" component="h2">
                        Profit Analysis
                      </Typography>
                      <IconButton onClick={copyResults} size="small" color="primary" title="Copy results">
                        <ContentCopyIcon />
                      </IconButton>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="subtitle2" color="textSecondary">
                            Total Cost
                          </Typography>
                          <Typography variant="h5" component="div" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                            ₹{calculateTotalCost()}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="subtitle2" color="textSecondary">
                            Estimated Revenue
                          </Typography>
                          <Typography variant="h5" component="div" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                            ₹{result.estimated_revenue}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="subtitle2" color="textSecondary">
                            Profit
                          </Typography>
                          <Typography
                            variant="h5"
                            component="div"
                            sx={{
                              fontWeight: 'bold',
                              color: parseFloat(result.estimated_profit) > 0 ? 'success.main' : 'error.main',
                            }}
                          >
                            ₹{result.estimated_profit}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'medium' }}>
                            ROI: {result.roi}%
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Analysis
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {result.analysis}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon sx={{ mr: 1 }} color="primary" /> Risk Assessment
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      {result.risk_assessment}
                    </Typography>
                    
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell>Risk Factor</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Mitigation Strategy</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {result.risk_factors && result.risk_factors.map((risk, index) => (
                            <TableRow key={index}>
                              <TableCell>{risk.factor}</TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 
                                      risk.level === 'High' ? 'error.main' :
                                      risk.level === 'Medium' ? 'warning.main' : 'success.main'
                                  }}
                                >
                                  {risk.level}
                                </Typography>
                              </TableCell>
                              <TableCell>{risk.mitigation}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {result.market_outlook && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Market Outlook
                        </Typography>
                        <Typography variant="body1">
                          {result.market_outlook}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PieChartIcon />}
                        sx={{ mr: 1 }}
                      >
                        View Charts
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                      >
                        Download Report
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CropProfit;
