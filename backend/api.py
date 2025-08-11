from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import shutil
import uuid
from pathlib import Path

from crop_doctor import analyze_crop_image

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Crop Doctor API",
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
