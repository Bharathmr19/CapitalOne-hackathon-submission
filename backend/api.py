from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from dotenv import load_dotenv
import os
import shutil
import uuid
from pathlib import Path

from crop_doctor import analyze_crop_image
from advisor import analyze_market
from weather_irrigation import generate_weather_and_irrigation_advice
from scheme_advisor import analyze_schemes
from profit_prediction import predict_crop_profit

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AgriSage",
    description="Diagnose crop diseases from images using Gemini Vision API.",
    version="1.0.0"
)

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CropDiagnosisResponse(BaseModel):
    disease_name: str
    severity: str
    recommended_treatment: str

class MarketRequest(BaseModel):
    crop_name: str
    region: str

class WeatherIrrigationRequest(BaseModel):
    crop_name: str
    region: str

class IrrigationSchedule(BaseModel):
    day: str
    action: str
    water_liters: Optional[float]
    timing: str
    reason: str

class WeatherConditions(BaseModel):
    temperature: str
    humidity: str
    wind_speed: str
    rainfall_last_24h: str

class AgriculturalMetrics(BaseModel):
    soil_moisture_trend: str
    evaporation_rate: str
    drought_risk: str
    pest_risk: str

class WeatherData(BaseModel):
    current_conditions: WeatherConditions
    daily_forecast: List[dict] = []
    agricultural_metrics: AgriculturalMetrics

class WeatherIrrigationResponse(BaseModel):
    crop_name: str
    region: str
    weather_data: WeatherData
    irrigation_schedule: List[IrrigationSchedule]
    risk_alerts: List[str]
    protective_measures: List[str]
    notes: str
    water_conservation_tips: List[str]
    warning: Optional[str] = None
    sources: List[str]

class MarketResponse(BaseModel):
    crop_name: str
    region: str
    trend_info: dict
    recommended_action: str | None = None
    confidence: float | None = None
    rationale: str | None = None
    alternate_markets: list | None = None
    notes: str | None = None
    sources: list[str]

class SchemeRequest(BaseModel):
    farmer_name: str
    region: str
    crop: str
    farm_size: str
    need: str

class SchemeInfo(BaseModel):
    name: str
    description: str
    eligibility: str
    benefits: str
    application_process: str
    official_link: str

class SchemeResponse(BaseModel):
    matched_schemes: List[SchemeInfo]
    personalized_recommendation: str
    next_steps: str
    error: Optional[str] = None
    sources: List[str]

class ProfitRequest(BaseModel):
    region: str
    crop: str
    farm_size: str
    expected_yield: str
    cost_factors: str

class ProfitResponse(BaseModel):
    crop_name: str
    region: str
    estimated_yield: str
    market_price: str
    total_cost: str
    expected_revenue: str
    expected_profit: str
    risk_factors: List[str]
    recommendation: str
    notes: str
    error: Optional[str] = None
    sources: List[str]

@app.post("/weather-irrigation", response_model=WeatherIrrigationResponse)
async def weather_irrigation_endpoint(request: WeatherIrrigationRequest):
    """
    Get weather forecast and irrigation advice for a specific crop in a region.
    """
    try:
        result = await generate_weather_and_irrigation_advice(request.crop_name, request.region)
        return WeatherIrrigationResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/smart-market", response_model=MarketResponse)
async def smart_market_endpoint(request: MarketRequest):
    """
    Get market analysis and advice for a specific crop in a region.
    """
    try:
        result = await analyze_market(request.crop_name, request.region)
        return MarketResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/crop-doctor", response_model=CropDiagnosisResponse)
async def crop_doctor_endpoint(file: UploadFile = File(...)):
    """
    Analyze crop disease from an uploaded image.
    
    Args:
        file (UploadFile): The image file to analyze (JPEG or PNG)
        
    Returns:
        CropDiagnosisResponse: Diagnosis including disease name, severity, and treatment
    """
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid file type. Only JPEG and PNG images are supported."
        )

    # Create temporary directory if it doesn't exist
    tmp_dir = Path("/tmp")
    tmp_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    tmp_filename = f"crop_{uuid.uuid4().hex}.{file.filename.split('.')[-1]}"
    tmp_filepath = tmp_dir / tmp_filename

    try:
        # Save uploaded file temporarily
        with open(tmp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Analyze the image
        result = analyze_crop_image(str(tmp_filepath))
        
        # Validate response structure
        if not isinstance(result, dict):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Model response is not valid."
            )
            
        # Validate required fields
        required_fields = ["disease_name", "severity", "recommended_treatment"]
        for field in required_fields:
            if field not in result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Missing required field: {field}"
                )
                
        return CropDiagnosisResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        # Clean up temporary file
        try:
            if tmp_filepath.exists():
                tmp_filepath.unlink()
        except Exception:
            pass  # Best effort cleanup

@app.post("/govt-schemes", response_model=SchemeResponse)
async def govt_schemes_endpoint(request: SchemeRequest):
    """
    Get government scheme recommendations for a farmer based on their profile and needs.
    
    Args:
        request (SchemeRequest): The farmer's profile and needs
        
    Returns:
        SchemeResponse: Matched schemes and personalized recommendations
    """
    try:
        # Validate required fields
        required_fields = ["farmer_name", "region", "crop", "farm_size", "need"]
        for field in required_fields:
            if not getattr(request, field):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Convert request model to dictionary
        user_input = {
            "farmer_name": request.farmer_name,
            "region": request.region,
            "crop": request.crop,
            "farm_size": request.farm_size,
            "need": request.need
        }
        
        # Process the request through scheme advisor
        result = await analyze_schemes(user_input)
        
        # Check if there was an error in the scheme advisor
        if result.get("error"):
            if "unable to fetch" in result["error"].lower():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=result["error"]
                )
        
        return SchemeResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/crop-profit", response_model=ProfitResponse)
async def crop_profit_endpoint(request: ProfitRequest):
    """
    Get profit prediction for a specific crop in a region with given parameters.
    
    Args:
        request (ProfitRequest): The crop and farm details
        
    Returns:
        ProfitResponse: Detailed profit analysis and recommendations
    """
    try:
        # Validate required fields
        required_fields = ["region", "crop", "farm_size", "expected_yield", "cost_factors"]
        for field in required_fields:
            if not getattr(request, field):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Convert request model to dictionary
        user_input = {
            "region": request.region,
            "crop": request.crop,
            "farm_size": request.farm_size,
            "expected_yield": request.expected_yield,
            "cost_factors": request.cost_factors
        }
        
        # Process the request through profit prediction
        result = await predict_crop_profit(user_input)
        
        # Check if there was an error in the profit prediction
        if result.get("error"):
            if "unable to fetch" in result["error"].lower():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=result["error"]
                )
        
        return ProfitResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
