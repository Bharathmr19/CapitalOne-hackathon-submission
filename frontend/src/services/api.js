import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Weather and Irrigation service
export const getWeatherIrrigationAdvice = async (cropName, region) => {
  try {
    const response = await api.post('/weather-irrigation', { crop_name: cropName, region });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { detail: 'Network error' };
  }
};

// Market Analysis service
export const getMarketAnalysis = async (cropName, region) => {
  try {
    const response = await api.post('/smart-market', { crop_name: cropName, region });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { detail: 'Network error' };
  }
};

// Crop Doctor service
export const analyzeCropImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await axios.post(`${API_URL}/crop-doctor`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { detail: 'Network error' };
  }
};

// Government Schemes service
export const getGovernmentSchemes = async (farmerProfile) => {
  try {
    const response = await api.post('/govt-schemes', farmerProfile);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { detail: 'Network error' };
  }
};

// Crop Profit Prediction service
export const predictCropProfit = async (cropData) => {
  try {
    const response = await api.post('/crop-profit', cropData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { detail: 'Network error' };
  }
};

export default api;
