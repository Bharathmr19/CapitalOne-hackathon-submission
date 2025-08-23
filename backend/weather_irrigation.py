import asyncio
import json
import logging
import os
from typing import Dict, Optional

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WeatherIrrigationError(Exception):
    """Custom exception for weather irrigation service errors"""
    pass

async def query_perplexity_for_weather(crop_name: str, region: str) -> Optional[Dict]:
    """
    Query Perplexity API for weather data using sonar-pro model
    
    Args:
        crop_name: Name of the crop
        region: Geographic region
        
    Returns:
        Dict containing weather data or None on failure
    """
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        logger.error("PERPLEXITY_API_KEY not found in environment variables")
        return None
    
    url = "https://api.perplexity.ai/chat/completions"
    
    # Craft a detailed weather query
    weather_query = f"""
    Provide current weather conditions and 7-day forecast for {region} region relevant for {crop_name} cultivation.
    Include:
    - Current temperature, humidity, rainfall
    - 7-day temperature highs/lows
    - Rainfall predictions and amounts
    - Wind conditions
    - Any weather alerts or warnings
    - Soil moisture considerations
    
    Format as detailed weather report with specific measurements and dates.
    """
    
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "user", "content": weather_query}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    max_retries = 3
    timeout = 30.0
    
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract the weather content from Perplexity response
                    weather_content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    # Print the weather content for debugging
                    logger.info(f"Weather data from Perplexity:\n{weather_content}")
                    
                    # Parse and structure the weather data
                    weather_data = {
                        "raw_forecast": weather_content,
                        "region": region,
                        "crop": crop_name,
                        "timestamp": data.get("created", ""),
                    }
                    
                    logger.info(f"Successfully fetched weather data for {crop_name} in {region}")
                    return weather_data
                    
                else:
                    logger.warning(f"Perplexity API returned status {response.status_code}: {response.text}")
                    if attempt == max_retries - 1:
                        return None
                        
        except httpx.TimeoutException:
            logger.warning(f"Timeout occurred on attempt {attempt + 1}")
            if attempt == max_retries - 1:
                logger.error("Max retries exceeded due to timeouts")
                return None
                
        except Exception as e:
            logger.error(f"Error querying Perplexity API on attempt {attempt + 1}: {str(e)}")
            if attempt == max_retries - 1:
                return None
                
        # Wait before retrying
        if attempt < max_retries - 1:
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    return None

async def generate_weather_and_irrigation_advice(crop_name: str, region: str) -> Dict:
    """
    Main orchestration function to generate complete weather and irrigation advice
    
    Args:
        crop_name: Name of the crop
        region: Geographic region
        
    Returns:
        Dict containing complete advice or error information
    """
    logger.info(f"Generating weather and irrigation advice for {crop_name} in {region}")
    
    # Step 1: Get weather data from Perplexity
    weather_data = await query_perplexity_for_weather(crop_name, region)
    
    if weather_data is None:
        logger.error("Failed to fetch weather data from Perplexity")
        raise WeatherIrrigationError("Unable to fetch weather data. Please try again later.")
    
    # Step 2: Create a simplified response structure
    result = {
        "crop_name": crop_name,
        "region": region,
        "weather_data": {
            "current_conditions": {
                "temperature": "Unknown",
                "humidity": "Unknown",
                "wind_speed": "Unknown",
                "rainfall_last_24h": "Unknown"
            },
            "daily_forecast": [],
            "agricultural_metrics": {
                "soil_moisture_trend": "Unknown",
                "evaporation_rate": "Unknown",
                "drought_risk": "Unknown",
                "pest_risk": "Unknown"
            }
        },
        "irrigation_schedule": [
            {
                "day": "Daily",
                "action": "Monitor soil moisture",
                "water_liters": 0,
                "timing": "Morning and Evening",
                "reason": "Standard practice for dry conditions"
            }
        ],
        "risk_alerts": [],
        "protective_measures": [],
        "notes": "",
        "water_conservation_tips": [],
        "warning": None,
        "sources": ["Perplexity Weather Analysis"]
    }
    
        # Parse weather data if available
    if isinstance(weather_data, dict) and "raw_forecast" in weather_data:
        content = weather_data["raw_forecast"]
        
        # Find the current conditions section
        sections = content.split("\n\n")
        current_section = ""
        try:
            for section in sections:
                if "Current conditions" in section:
                    current_section = section
                    break
                    
            if not current_section:
                # If we didn't find a section with "Current conditions", use the first few lines
                current_section = sections[0]
            
            # Initialize with default values
            temperature = "Not available"
            humidity = "Not available"
            wind_speed = "Not available"
            rainfall = "Not available"
            
            # Parse the current section line by line
            lines = current_section.split("\n")
            for line in lines:
                line = line.strip()
                # Look for temperature
                if "Temperature:" in line or "- Temperature:" in line:
                    try:
                        temp_part = line.split("Temperature:")[1].strip() if "Temperature:" in line else line.split("- Temperature:")[1].strip()
                        temperature = temp_part.split(";")[0].strip()
                    except:
                        pass
                        
                # Look for humidity
                elif "Humidity:" in line or "- Humidity:" in line:
                    try:
                        humid_part = line.split("Humidity:")[1].strip() if "Humidity:" in line else line.split("- Humidity:")[1].strip()
                        humidity = humid_part.split(";")[0].strip()
                    except:
                        pass
                        
                # Look for wind
                elif "Wind:" in line or "- Wind:" in line:
                    try:
                        wind_part = line.split("Wind:")[1].strip() if "Wind:" in line else line.split("- Wind:")[1].strip()
                        wind_speed = wind_part.split(";")[0].strip()
                    except:
                        pass
                        
                # Look for rainfall
                elif "Rainfall" in line or "- Rainfall" in line:
                    try:
                        rain_part = line.split("Rainfall")[1].strip() if "Rainfall" in line else line.split("- Rainfall")[1].strip()
                        rainfall = rain_part.split(";")[0].strip().strip(":")
                    except:
                        pass
            
        except Exception as e:
            logger.warning(f"Error parsing current conditions: {str(e)}")
            
        # Update the result with what we found
        result["weather_data"]["current_conditions"].update({
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "rainfall_last_24h": rainfall
        })        # Extract 7-day forecast
        try:
            daily_forecast = []
            forecast_section = ""
            for section in sections:
                if "7-day forecast" in section:
                    forecast_section = section
                    break
            
            if forecast_section:
                lines = forecast_section.split("\n")
                for line in lines:
                    if "- " in line and any(day in line.lower() for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]):
                        try:
                            forecast_day = {
                                "date": line.split(":")[0].strip("- ").strip(),
                                "conditions": line.split(":")[1].strip() if ":" in line else line.strip("- ").strip()
                            }
                            daily_forecast.append(forecast_day)
                        except:
                            continue
            
            result["weather_data"]["daily_forecast"] = daily_forecast
        except Exception as e:
            logger.warning(f"Error parsing daily forecast: {str(e)}")
            
        # Extract irrigation schedule from field actions or soil moisture sections
        irrigation_schedule = []
        try:
            for section in sections:
                if any(keyword in section.lower() for keyword in ["field actions", "soil moisture", "practical guidance", "irrigation"]):
                    lines = section.split("\n")
                    for line in lines:
                        if line.strip().startswith("-") or line.strip().startswith("*"):
                            action = line.strip("- *").strip()
                            if action and not action.endswith(":"):
                                irrigation_schedule.append({
                                    "day": "Daily",
                                    "action": action,
                                    "water_liters": 0,
                                    "timing": "As needed",
                                    "reason": "Based on conditions and forecast"
                                })
            
            if irrigation_schedule:
                result["irrigation_schedule"] = irrigation_schedule
            else:
                # Ensure we have at least one default irrigation action
                result["irrigation_schedule"] = [{
                    "day": "Daily",
                    "action": "Monitor soil moisture and irrigate as needed",
                    "water_liters": 0,
                    "timing": "Early morning",
                    "reason": "Standard practice for dry conditions"
                }]
        except Exception as e:
            logger.warning(f"Error parsing irrigation schedule: {str(e)}")
        
        # Extract alerts, protective measures, and other information
        try:
            alerts = []
            conservation_tips = []
            protective_measures = []
            notes = []
            
            for section in sections:
                section_lower = section.lower()
                
                # Look for alerts
                if "alert" in section_lower or "warning" in section_lower:
                    lines = section.split("\n")
                    for line in lines:
                        line = line.strip("- *").strip()
                        if line and not line.endswith(":") and not line.lower().startswith(("note", "context")):
                            alerts.append(line)
                
                # Look for conservation tips and protective measures
                if any(keyword in section_lower for keyword in ["guidance", "field actions", "practical", "protection"]):
                    lines = section.split("\n")
                    for line in lines:
                        line = line.strip("- *").strip()
                        if line and not line.endswith(":"):
                            if "conserv" in line.lower() or "water" in line.lower():
                                conservation_tips.append(line)
                            else:
                                protective_measures.append(line)
                
                # Look for soil moisture notes
                if "soil moisture" in section_lower:
                    lines = section.split("\n")
                    for line in lines:
                        line = line.strip("- *").strip()
                        if line and not line.endswith(":"):
                            notes.append(line)
            
            # Update the result with what we found
            if alerts:
                result["risk_alerts"] = alerts
            if conservation_tips:
                result["water_conservation_tips"] = conservation_tips
            if protective_measures:
                result["protective_measures"] = protective_measures
            if notes:
                result["notes"] = " ".join(notes)
                
        except Exception as e:
            logger.warning(f"Error parsing alerts and measures: {str(e)}")
    
    # Clean up empty lists
    if not result["risk_alerts"]:
        result["risk_alerts"] = ["No specific risk alerts at this time"]
    if not result["protective_measures"]:
        result["protective_measures"] = ["Monitor crop conditions regularly"]
    if not result["water_conservation_tips"]:
        result["water_conservation_tips"] = ["Follow standard water conservation practices"]
    if not result["notes"]:
        result["notes"] = "Use standard agricultural practices appropriate for the season"
    
    logger.info("Successfully generated weather and irrigation advice")
    return result
