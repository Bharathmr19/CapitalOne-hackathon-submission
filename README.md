# AgriAssist - Your Agricultural Assistant

## Overview
AgriAssist is a comprehensive agricultural assistant platform designed to empower farmers with data-driven insights and decision-making tools. The application integrates multiple services to help farmers optimize their agricultural practices, increase yields, and maximize profits.

## Features

### 🌱 Crop Doctor
Diagnose crop diseases and get treatment recommendations by simply uploading images of affected plants. Our AI-powered system can identify common crop diseases and provide actionable insights.

### ☔ Weather & Irrigation Advisor
Get personalized irrigation recommendations based on real-time weather forecasts, crop type, and soil conditions. Optimize water usage and protect crops from adverse weather conditions.

### 📊 Smart Market Analysis
Access up-to-date market trends and price forecasts to make informed decisions about when to sell your produce and which crops to plant next season.

### 💰 Crop Profit Prediction
Calculate potential returns on crop investments by analyzing input costs, expected yield, and market prices. Understand ROI and risk factors before committing to a crop.

### 🏢 Government Scheme Advisor
Discover and apply for relevant agricultural subsidy programs. Get matched with government schemes based on your profile, location, and farming needs.

## Technology Stack

### Backend
- **Framework**: FastAPI
- **AI Integration**: Gemini AI (2.5 Pro/Flash)
- **Data Services**: Perplexity API
- **Async Processing**: Python asyncio

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI
- **API Integration**: Axios
- **State Management**: React Hooks
- **Routing**: React Router
- **Notifications**: React Toastify
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.10+)
- pip
- npm or yarn

### Installation

#### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install required packages:
   ```
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```
   uvicorn api:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The application will be available at http://localhost:3000

## API Endpoints

- `/crop-doctor` - Upload crop images for disease diagnosis
- `/weather-irrigation` - Get irrigation recommendations based on weather conditions
- `/smart-market` - Access market trends and price forecasts
- `/govt-schemes` - Discover relevant government agricultural schemes
- `/crop-profit` - Calculate potential crop profitability

## Contributing
We welcome contributions to enhance AgriAssist! Please feel free to submit a pull request or open an issue to discuss proposed changes.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

