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
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  Link,
  useTheme
} from '@mui/material';
import { 
  ReceiptLong as ReceiptLongIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';
import { getGovernmentSchemes } from '../services/api';

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

const needs = [
  'Subsidy for irrigation',
  'Loan for equipment',
  'Insurance for crops',
  'Fertilizer subsidy',
  'Marketing assistance',
  'Storage facility subsidy',
  'Solar pump subsidy',
  'Drip irrigation support',
  'Organic farming certification',
  'Cold storage subsidy'
];

const farmSizes = [
  'Less than 1 acre',
  '1-2 acres',
  '2-5 acres',
  '5-10 acres',
  'More than 10 acres'
];

const GovtSchemes = () => {
  const [formData, setFormData] = useState({
    farmer_name: '',
    region: '',
    crop: '',
    farm_size: '',
    need: ''
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
    
    // Validate all required fields
    const requiredFields = ['farmer_name', 'region', 'crop', 'farm_size', 'need'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getGovernmentSchemes(formData);
      setResult(data);
      
      toast.success('Schemes found for your profile');
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError(err);
      toast.error('Failed to fetch government schemes');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      farmer_name: '',
      region: '',
      crop: '',
      farm_size: '',
      need: ''
    });
    setResult(null);
    setError(null);
  };
  
  return (
    <Box component="main">
      <PageHeader
        title="Government Schemes"
        description="Discover and apply for relevant agricultural subsidy programs"
        backgroundImage="https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1729&q=80"
        icon={<ReceiptLongIcon fontSize="large" />}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Find Government Schemes
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Farmer Name"
                    name="farmer_name"
                    value={formData.farmer_name}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                    helperText="Enter your full name"
                  />
                  
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
                    helperText="Select your state"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </TextField>
                  
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
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </TextField>
                  
                  <TextField
                    select
                    fullWidth
                    label="Farm Size"
                    name="farm_size"
                    value={formData.farm_size}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                  >
                    {farmSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </TextField>
                  
                  <TextField
                    select
                    fullWidth
                    label="Specific Need"
                    name="need"
                    value={formData.need}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                    helperText="What type of support are you looking for?"
                  >
                    {needs.map((need) => (
                      <option key={need} value={need}>
                        {need}
                      </option>
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
                      disabled={loading}
                      sx={{ flex: 1 }}
                    >
                      Find Schemes
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
            
            {result && (
              <Card sx={{ bgcolor: 'primary.light' }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'primary.dark' }}>
                    Next Steps
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                    {result.next_steps}
                  </Typography>
                  <Button 
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    fullWidth
                  >
                    Find Local Office
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            {loading && <LoadingIndicator message="Searching for relevant government schemes..." />}
            
            {error && <ErrorDisplay error={error} resetError={resetForm} />}
            
            {result && !loading && (
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Schemes Matched to Your Profile
                </Typography>
                
                <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
                  {result.personalized_recommendation}
                </Typography>
                
                {result.matched_schemes.length > 0 ? (
                  result.matched_schemes.map((scheme, index) => (
                    <Accordion key={index} sx={{ mb: 2 }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ bgcolor: 'background.default' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="medium">
                            {scheme.name}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="body1" paragraph>
                              {scheme.description}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Eligibility
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {scheme.eligibility}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Benefits
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {scheme.benefits}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Application Process
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {scheme.application_process}
                            </Typography>
                          </Grid>
                          
                          {scheme.official_link && (
                            <Grid item xs={12}>
                              <Link
                                href={scheme.official_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
                              >
                                <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Official Website
                              </Link>
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="body1">
                      No matching schemes found. Try changing your search criteria.
                    </Typography>
                  </Paper>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Sources: {result.sources.join(", ")}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GovtSchemes;
