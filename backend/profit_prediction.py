import asyncio
import json
import logging
import os
from typing import Dict, List, Optional

import httpx
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validate API keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")
if not PERPLEXITY_API_KEY:
    raise RuntimeError("PERPLEXITY_API_KEY not found in environment variables")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-pro')
flash_model = genai.GenerativeModel('gemini-2.5-flash')

def get_market_price_range(crop_name):
    """Get realistic market price ranges for crops (per quintal in INR)"""
    # Updated market prices based on current Indian agricultural market rates
    price_ranges = {
        'rice': {'min': 1800, 'max': 2500, 'unit': 'per quintal'},
        'wheat': {'min': 2000, 'max': 2400, 'unit': 'per quintal'},
        'maize': {'min': 1500, 'max': 2100, 'unit': 'per quintal'},
        'sugarcane': {'min': 280, 'max': 350, 'unit': 'per quintal'},
        'cotton': {'min': 5000, 'max': 6000, 'unit': 'per quintal'},
        'groundnut': {'min': 4500, 'max': 5500, 'unit': 'per quintal'},
        'soybean': {'min': 3500, 'max': 4200, 'unit': 'per quintal'},
        'mustard': {'min': 4000, 'max': 5000, 'unit': 'per quintal'},
        'potato': {'min': 1000, 'max': 1500, 'unit': 'per quintal'},
        'tomato': {'min': 1200, 'max': 3000, 'unit': 'per quintal'},
        'onion': {'min': 1500, 'max': 3500, 'unit': 'per quintal'},
        'chili': {'min': 6000, 'max': 10000, 'unit': 'per quintal'},
        'turmeric': {'min': 6500, 'max': 8500, 'unit': 'per quintal'},
        'banana': {'min': 2500, 'max': 4000, 'unit': 'per quintal'},
        'mango': {'min': 4000, 'max': 8000, 'unit': 'per quintal'}
    }
    
    return price_ranges.get(crop_name.lower(), {'min': 2000, 'max': 3000, 'unit': 'per quintal'})

class ProfitPredictionError(Exception):
    """Custom exception for profit prediction service errors"""
    pass

async def refine_user_request_with_gemini(user_input: dict) -> str:
    """
    Takes user-provided input and converts it into a structured query
    for predicting crop profit potential using Gemini.
    
    Args:
        user_input (dict): User-provided information including region, crop, farm size, etc.
        
    Returns:
        str: A refined query string for searching profit prediction data
        
    Raises:
        ProfitPredictionError: If there's an error processing the request with Gemini
    """
    try:
        prompt = f"""You are a query refinement assistant. Convert this user request into a structured query for predicting crop profit potential.

User information:
Region: {user_input.get('region', 'Unknown')}
Crop: {user_input.get('crop', 'Unknown')}
Farm size: {user_input.get('farm_size', 'Unknown')}
Expected yield: {user_input.get('expected_yield', 'Unknown')}
Cost factors: {user_input.get('cost_factors', 'Unknown')}

Respond ONLY with a clear, concise search query to find the most relevant profit prediction data (no explanations).
"""
        
        response = model.generate_content(prompt)
        
        if not response.text:
            logger.error("Empty response from Gemini for query refinement")
            raise ProfitPredictionError("Failed to process query")
            
        # Clean and return the refined query
        refined_query = response.text.strip()
        logger.info(f"Refined query: {refined_query}")
        
        return refined_query
        
    except Exception as e:
        logger.error(f"Error in refine_user_request_with_gemini: {str(e)}")
        raise ProfitPredictionError(f"Failed to refine query: {str(e)}")

async def query_perplexity_for_profit_data(query: str) -> Optional[Dict]:
    """
    Query Perplexity API for crop profit data including market prices and input costs.
    
    Args:
        query (str): The refined query string from Gemini
        
    Returns:
        Optional[Dict]: JSON object containing profit data or None on failure
        
    Raises:
        ProfitPredictionError: If there's an error querying Perplexity API
    """
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    perplexity_query = f"""Research the following crop profit prediction query: 
    {query}
    
    Provide detailed information on:
    1. Current market price for the crop in the specified region
    2. Typical input costs (fertilizer, irrigation, seeds, labor, pesticides, etc.)
    3. Historical price trend summary for the last 12 months
    4. Yield expectations for this crop in the region
    5. Any risk factors affecting profitability
    
    Return ONLY valid JSON with this structure:
    {{
      "market_data": {{
        "current_price": "string (price per unit with unit)",
        "price_trend": "string (summary of recent trends)",
        "price_forecast": "string (expected price movement)"
      }},
      "input_costs": {{
        "fertilizer": "string (cost per acre)",
        "seeds": "string (cost per acre)",
        "irrigation": "string (cost per acre)",
        "labor": "string (cost per acre)",
        "pesticides": "string (cost per acre)",
        "equipment": "string (cost per acre)",
        "miscellaneous": "string (cost per acre)"
      }},
      "yield_data": {{
        "average_yield": "string (yield per acre with unit)",
        "quality_factors": "string"
      }},
      "risk_factors": ["string"],
      "source": "string"
    }}
    
    Use the most recent and accurate data available."""
    
    payload = {
        "model": "sonar-pro",
        "messages": [{"role": "user", "content": perplexity_query}],
        "max_tokens": 2048,
        "temperature": 0.1  # Lower temperature for more factual responses
    }
    
    max_retries = 3
    timeout = 30.0
    
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, 
                    headers=headers, 
                    json=payload, 
                    timeout=timeout
                )
                
                response.raise_for_status()
                
                # Extract JSON from the response text
                content = response.json()["choices"][0]["message"]["content"]
                
                # Find and parse JSON in the response
                start = content.find('{')
                end = content.rfind('}') + 1
                
                if start != -1 and end != 0:
                    json_str = content[start:end]
                    result = json.loads(json_str)
                    
                    # Validate required structure
                    required_sections = ["market_data", "input_costs", "yield_data", "risk_factors"]
                    for section in required_sections:
                        if section not in result:
                            logger.warning(f"Missing required section '{section}' in Perplexity response")
                            if attempt == max_retries - 1:
                                return None
                            continue
                    
                    logger.info("Successfully fetched crop profit data from Perplexity")
                    return result
                else:
                    logger.warning("No valid JSON found in Perplexity response")
                    if attempt == max_retries - 1:
                        return None
            
        except (httpx.RequestError, json.JSONDecodeError, KeyError) as e:
            logger.error(f"Error querying Perplexity API on attempt {attempt + 1}: {str(e)}")
            if attempt == max_retries - 1:
                raise ProfitPredictionError(f"Failed to query Perplexity: {str(e)}")
        
        # Wait before retrying with exponential backoff
        if attempt < max_retries - 1:
            await asyncio.sleep(2 ** attempt)
    
    return None

async def expand_profit_prediction_with_gemini(perplexity_data: dict, user_input: dict) -> Optional[Dict]:
    """
    Generate a comprehensive profit prediction using Gemini 2.5 Flash.
    
    Args:
        perplexity_data (dict): Data from Perplexity API
        user_input (dict): Original user input
        
    Returns:
        Optional[Dict]: Expanded profit prediction with detailed analysis
        
    Raises:
        ProfitPredictionError: If there's an error processing with Gemini
    """
    try:
        # Format the user profile and market data as strings
        user_profile = json.dumps(user_input, indent=2)
        market_data = json.dumps(perplexity_data, indent=2)
        
        prompt = f"""You are an agricultural economics expert. 
Based on the following farmer profile and market data, generate a JSON response:

User Profile: {user_profile}
Market Data: {market_data}

Required JSON Output:
{{
  "crop_name": "string",
  "region": "string",
  "estimated_yield": "string",
  "market_price": "string",
  "total_cost": "string",
  "expected_revenue": "string",
  "expected_profit": "string",
  "risk_factors": ["string"],
  "recommendation": "string",
  "notes": "string"
}}

Important guidelines:
1. Calculate the total_cost by multiplying per-acre costs by farm size
2. Calculate expected_revenue by multiplying yield by market price
3. Calculate expected_profit as revenue minus total cost
4. Include monetary values in Indian Rupees (₹)
5. Provide 2-3 specific risk factors that could impact profit
6. Give a clear recommendation on whether to proceed with this crop
7. Include helpful notes on improving profitability

Response MUST be valid JSON only."""
        
        # Use the flash model for faster response
        response = flash_model.generate_content(prompt)
        
        if not response.text:
            logger.error("Empty response from Gemini Flash")
            return None
            
        # Extract JSON from the response
        response_text = response.text
        start = response_text.find('{')
        end = response_text.rfind('}') + 1
        
        if start == -1 or end == 0:
            logger.error("No valid JSON found in Gemini response")
            return None
            
        json_str = response_text[start:end]
        result = json.loads(json_str)
        
        # Validate required fields
        required_fields = ["crop_name", "region", "estimated_yield", "market_price", 
                          "total_cost", "expected_revenue", "expected_profit", 
                          "risk_factors", "recommendation", "notes"]
                          
        for field in required_fields:
            if field not in result:
                logger.error(f"Missing required field in Gemini response: {field}")
                return None
                
        # Validate risk_factors is a list
        if not isinstance(result["risk_factors"], list):
            logger.error("risk_factors is not a list in Gemini response")
            return None
            
        return result
        
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Error in expand_profit_prediction_with_gemini: {str(e)}")
        return None

async def predict_crop_profit(user_input: dict) -> Dict:
    """
    Orchestrate the complete crop profit prediction process.
    
    Args:
        user_input (dict): User-provided information including crop details and costs
        
    Returns:
        Dict: Complete profit prediction with detailed analysis
        
    Raises:
        ProfitPredictionError: If there's a critical error in the process
    """
    logger.info(f"Predicting crop profit for {user_input.get('crop_name', 'Unknown')}")
    
    # Initialize response structure with defaults
    response = {
        "estimated_revenue": "0",
        "estimated_profit": "0", 
        "roi": "0",
        "analysis": "",
        "risk_assessment": "",
        "risk_factors": [],
        "market_outlook": "",
        "market_price_range": None,
        "sources": []
    }
    try:
        # Get basic cost and yield information from user input
        crop_name = user_input.get('crop_name', 'Unknown')
        land_area = float(user_input.get('land_area', 0))
        expected_yield = float(user_input.get('expected_yield', 0))
        total_cost = float(user_input.get('total_cost', 0))
        
        # Get realistic market price range for the crop
        market_price_info = get_market_price_range(crop_name)
        avg_market_price = (market_price_info['min'] + market_price_info['max']) / 2
        response["market_price_range"] = market_price_info
        
        # Step 1: Refine user request with Gemini
        refined_query = await refine_user_request_with_gemini(user_input)
        
        # Step 2: Query Perplexity for market data
        perplexity_data = await query_perplexity_for_profit_data(refined_query)
        
        if not perplexity_data:
            # Fallback calculation with realistic market prices
            estimated_revenue = expected_yield * avg_market_price
            estimated_profit = estimated_revenue - total_cost
            roi = ((estimated_profit / total_cost) * 100) if total_cost > 0 else 0
            
            response.update({
                "estimated_revenue": str(int(estimated_revenue)),
                "estimated_profit": str(int(estimated_profit)),
                "roi": f"{roi:.1f}",
                "analysis": f"Calculation for {crop_name}: Expected yield {expected_yield} quintals at avg price ₹{int(avg_market_price)}/quintal. Revenue: ₹{int(estimated_revenue)}, Costs: ₹{int(total_cost)}, Profit: ₹{int(estimated_profit)}",
                "risk_assessment": "Market data unavailable. Consider weather, market volatility, and input cost fluctuations.",
                "market_outlook": f"Current market price for {crop_name} ranges from ₹{market_price_info['min']} to ₹{market_price_info['max']} per quintal.",
                "sources": ["market_data", "calculation"]
            })
            return response
            
        response["sources"].append("perplexity")
        
        # Step 3: Expand profit prediction with Gemini 2.5 Flash
        expanded_data = await expand_profit_prediction_with_gemini(perplexity_data, user_input)
        
        if expanded_data:
            # Update response with expanded data
            for key, value in expanded_data.items():
                if key in response:
                    response[key] = value
                    
            response["sources"].append("gemini")
        else:
            # Fall back to calculation with realistic market prices
            estimated_revenue = expected_yield * avg_market_price
            estimated_profit = estimated_revenue - total_cost
            roi = ((estimated_profit / total_cost) * 100) if total_cost > 0 else 0
            
            response.update({
                "estimated_revenue": str(int(estimated_revenue)),
                "estimated_profit": str(int(estimated_profit)),
                "roi": f"{roi:.1f}",
                "analysis": f"Based on current market rates for {crop_name}. Expected yield: {expected_yield} quintals at ₹{int(avg_market_price)}/quintal. Revenue: ₹{int(estimated_revenue)}, Costs: ₹{int(total_cost)}, Profit: ₹{int(estimated_profit)}",
                "risk_assessment": "Consider market volatility, weather risks, and input cost changes.",
                "market_outlook": f"Current market price for {crop_name} ranges from ₹{market_price_info['min']} to ₹{market_price_info['max']} per quintal. Prices may vary based on quality, location, and seasonal factors.",
                "risk_factors": [
                    {"factor": "Market Price Volatility", "level": "Medium", "mitigation": "Monitor market trends and consider forward contracts"},
                    {"factor": "Weather Risk", "level": "High", "mitigation": "Use crop insurance and drought-resistant varieties"},
                    {"factor": "Input Cost Inflation", "level": "Medium", "mitigation": "Bulk purchase of inputs and efficient resource management"}
                ]
            })
        
    except Exception as e:
        logger.error(f"Unexpected error in predict_crop_profit: {str(e)}")
        # Provide basic fallback response
        try:
            crop_name = user_input.get('crop_name', 'Unknown')
            expected_yield = float(user_input.get('expected_yield', 0))
            total_cost = float(user_input.get('total_cost', 0))
            
            market_price_info = get_market_price_range(crop_name)
            avg_market_price = (market_price_info['min'] + market_price_info['max']) / 2
            
            estimated_revenue = expected_yield * avg_market_price
            estimated_profit = estimated_revenue - total_cost
            roi = ((estimated_profit / total_cost) * 100) if total_cost > 0 else 1
            
            response.update({
                "estimated_revenue": str(int(estimated_revenue)),
                "estimated_profit": str(int(estimated_profit)),
                "roi": f"{roi:.1f}",
                "analysis": f"Basic profit calculation for {crop_name}. Note: Error occurred during advanced analysis: {str(e)}",
                "risk_assessment": "Unable to perform detailed analysis due to technical issues. Please try again later.",
                "market_price_range": market_price_info,
                "sources": ["fallback_calculation"]
            })
        except:
            response.update({
                "estimated_revenue": "0",
                "estimated_profit": "0",
                "roi": "0",
                "analysis": "Unable to calculate profit due to insufficient data or technical issues.",
                "risk_assessment": "Please check your input data and try again.",
                "sources": ["error"]
            })
    
    return response
