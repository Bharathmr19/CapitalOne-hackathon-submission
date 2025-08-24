import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Alert,
  Divider,
  Chip,
  Paper,
  styled,
  useTheme
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  LocalHospital as LocalHospitalIcon,
  Biotech as BiotechIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  HealthAndSafety as HealthIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';
import { analyzeCropImage } from '../services/api';

// Styled components
const DropzoneContainer = styled(Box)(({ theme, isDragActive, isDragReject }) => ({
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  border: '2px dashed',
  borderColor: isDragReject 
    ? theme.palette.error.main
    : isDragActive
      ? theme.palette.primary.main
      : theme.palette.grey[400],
  backgroundColor: isDragReject 
    ? theme.palette.error.light
    : isDragActive
      ? theme.palette.primary.light
      : theme.palette.grey[100],
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  }
}));

const SeverityChip = styled(Chip)(({ theme, severity }) => {
  const colors = {
    Low: {
      bg: theme.palette.success.light,
      color: theme.palette.success.dark
    },
    Medium: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark
    },
    High: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark
    }
  };

  return {
    backgroundColor: colors[severity]?.bg || theme.palette.grey[300],
    color: colors[severity]?.color || theme.palette.text.primary,
    fontWeight: 600,
  };
});

const CropDoctor = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setResult(null);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    multiple: false
  });
  
  const handleAnalyzeImage = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await analyzeCropImage(file);
      setResult(data);
      
      // Show success message
      toast.success('Image analysis complete');
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err);
      toast.error('Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setPreview('');
    setResult(null);
    setError(null);
  };
  
  return (
    <Box component="main">
      <PageHeader
        title="Crop Doctor"
        description="Diagnose crop diseases from images using advanced AI technology"
        backgroundImage="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
        icon={<LocalHospitalIcon fontSize="large" />}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom>
              Upload Crop Image
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Take a clear photo of the affected crop part and upload it below. Our AI will analyze the image to identify diseases and recommend treatments.
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <DropzoneContainer
                {...getRootProps()}
                isDragActive={isDragActive}
                isDragReject={isDragReject}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" align="center" gutterBottom>
                  {isDragActive
                    ? "Drop the image here"
                    : "Drag & drop a crop image here, or click to select"}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  Supports JPEG and PNG formats only
                </Typography>
              </DropzoneContainer>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined"
                onClick={handleReset}
                disabled={!file || loading}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<BiotechIcon />}
                onClick={handleAnalyzeImage}
                disabled={!file || loading}
              >
                Analyze Image
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom>
              Preview & Results
            </Typography>
            
            {preview ? (
              <Box 
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <img 
                  src={preview} 
                  alt="Crop preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px',
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                />
              </Box>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  height: '300px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 3
                }}
              >
                <Typography color="text.secondary">
                  Image preview will appear here
                </Typography>
              </Paper>
            )}
            
            {loading && <LoadingIndicator message="Analyzing image..." />}
            
            {error && <ErrorDisplay error={error} resetError={handleReset} />}
            
            {result && !loading && (
              <Box 
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={{ mt: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HealthIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3">
                    Diagnosis Results
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle1" component="div" sx={{ mr: 2 }}>
                    Disease:
                  </Typography>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {result.disease_name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle1" component="div" sx={{ mr: 2 }}>
                    Severity:
                  </Typography>
                  <SeverityChip 
                    label={result.severity} 
                    severity={result.severity}
                    icon={
                      result.severity === 'Low' ? <CheckCircleIcon /> :
                      result.severity === 'Medium' ? <WarningIcon /> :
                      <WarningIcon />
                    }
                  />
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" component="div" sx={{ mb: 2 }}>
                  Recommended Treatment:
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  {result.recommended_treatment}
                </Alert>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CropDoctor;
