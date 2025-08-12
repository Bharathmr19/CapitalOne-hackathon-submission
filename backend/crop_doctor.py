import os
import json
from typing import Dict, Any
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables.")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-pro')  # Use the latest model version

def analyze_crop_image(image_file_path: str) -> Dict[str, str]:
    """
    Analyze a crop image using Gemini Vision API to detect diseases and recommend treatments.
    
    Args:
        image_file_path (str): Path to the image file to analyze
        
    Returns:
        Dict[str, str]: Dictionary containing disease name, severity, and recommended treatment
        
    Raises:
        ValueError: If the image file cannot be read or if the API response is invalid
        Exception: For other unexpected errors
    """
    try:
        # Load and validate image
        image_path = Path(image_file_path)
        if not image_path.exists():
            raise ValueError(f"Image file not found: {image_file_path}")
            
        image = Image.open(image_path)
        
        # Prepare the prompt for Gemini
        prompt = """You are an expert agricultural crop disease diagnostician. 
        Analyze this crop image and provide a detailed diagnosis. 
        Return your analysis in JSON format with these exact fields:
        {
            "disease_name": "Name of the identified disease",
            "severity": "Low/Medium/High based on visible symptoms",
            "recommended_treatment": "Detailed treatment recommendations"
        }
        Important: Respond ONLY with valid JSON."""

        # Generate response from Gemini
        # Convert image to base64 string
        import base64
        from io import BytesIO
        
        # Convert PIL image to base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Add image data to prompt
        full_prompt = prompt + f"\n\nImage data: {img_str}"
        
        response = model.generate_content(full_prompt)
        
        # Extract JSON from the response
        try:
            # Get response parts
            if not response.parts:
                raise ValueError("No response received from Gemini")
                
            response_text = response.parts[0].text
            # Find the first { and last } to extract JSON
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            
            if start == -1 or end == 0:
                raise ValueError("No JSON found in response")
                
            json_str = response_text[start:end]
            result = json.loads(json_str)
            
            # Validate required fields
            required_fields = ["disease_name", "severity", "recommended_treatment"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field in response: {field}")
            
            return result
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in model response: {str(e)}")
            
    except Exception as e:
        # Log the error (you should implement proper logging)
        print(f"Error in analyze_crop_image: {str(e)}")
        raise
