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
model = genai.GenerativeModel('gemini-2.5-flash')  # Use vision-capable model

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
        prompt = """You are an expert agricultural pathologist and crop disease diagnostician. 
        Carefully analyze this crop/plant image for any signs of disease, pest damage, or health issues.
        
        Look for:
        - Leaf spots, discoloration, or unusual markings
        - Wilting, browning, or yellowing of leaves
        - Pest damage or insect presence
        - Fungal growth or bacterial infections
        - Overall plant health indicators
        
        Provide your analysis in this exact JSON format:
        {
            "disease_name": "Specific disease name or 'Healthy' if no issues found",
            "severity": "Low/Medium/High or 'None' if healthy",
            "recommended_treatment": "Detailed treatment recommendations including fungicides, pesticides, cultural practices, or preventive measures"
        }
        
        Be specific and actionable in your recommendations. If the plant appears healthy, mention preventive care tips.
        Respond ONLY with valid JSON - no additional text."""

        # Generate response from Gemini with image
        response = model.generate_content([prompt, image])
        
        # Extract JSON from the response
        try:
            # Get response parts
            if not response.parts:
                print(f"Debug: Response object: {response}")
                print(f"Debug: Response candidates: {getattr(response, 'candidates', 'None')}")
                raise ValueError("No response received from Gemini")
                
            response_text = response.parts[0].text
            print(f"Debug: Raw response text: {response_text}")
            
            # Find the first { and last } to extract JSON
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            
            if start == -1 or end == 0:
                # If no JSON found, try to create a structured response from the text
                return {
                    "disease_name": "Analysis completed",
                    "severity": "Unable to determine",
                    "recommended_treatment": response_text
                }
                
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
