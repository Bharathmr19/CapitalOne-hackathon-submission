import os
import json
from typing import Dict, List, Optional
from datetime import datetime
import httpx
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Validate API keys
if not PERPLEXITY_API_KEY:
    raise RuntimeError("PERPLEXITY_API_KEY not found in environment variables")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-pro')

async def query_perplexity_for_price_trends(crop_name: str, region: str) -> Optional[Dict]:
    """
    Query Perplexity API for recent crop price trends in a specific region.
    
    Args:
        crop_name (str): Name of the crop
        region (str): Region/state name
        
    Returns:
        Optional[Dict]: Price trend data or None on failure
    """
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    from datetime import datetime
    current_date = datetime.now().strftime("%d-%b-%Y")
    
    query = f"""Get today's ({current_date}) real-time market price and trend data for {crop_name} in {region}. 
    Focus on:
    1. Today's actual market rates from the local APMC/mandi
    2. Current supply-demand situation
    3. Price comparison with last month
    
    Return response STRICTLY as JSON with these exact fields:
    {{
        "current_price_range": "₹X-₹Y per quintal (include per kg also)",
        "last_updated": "current date in DD-MMM-YYYY format",
        "trend_direction": "increasing/decreasing/stable",
        "month_over_month_change_percent": "% change with - for decrease",
        "supply_status": "current supply situation",
        "demand_status": "current demand situation",
        "market_yard": "name of APMC/mandi"
    }}"""
    
    payload = {
        "model": "sonar-pro",
        "messages": [{"role": "user", "content": query}],
        "max_tokens": 1024,
        "temperature": 0.1  # Lower temperature for more factual responses
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                url, 
                headers=headers, 
                json=payload, 
                timeout=30.0
            )
            response.raise_for_status()
            
            # Extract JSON from the response text
            content = response.json()["choices"][0]["message"]["content"]
            
            # Find and parse JSON in the response
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != 0:
                json_str = content[start:end]
                return json.loads(json_str)
            return None
            
        except (httpx.RequestError, json.JSONDecodeError, KeyError) as e:
            print(f"Error querying Perplexity API: {str(e)}")
            return None

async def ask_gemini_for_advice(
    crop_name: str, 
    region: str, 
    price_trend_info: Dict
) -> Optional[Dict]:
    """
    Generate market advice using Gemini based on price trends.
    
    Args:
        crop_name (str): Name of the crop
        region (str): Region/state name
        price_trend_info (Dict): Price trend data from Perplexity
        
    Returns:
        Optional[Dict]: Market advice or None on failure
    """
    try:
        prompt = f"""You are an experienced agricultural market analyst. Based on this CURRENT price trend data for {crop_name} in {region}:
        {json.dumps(price_trend_info, indent=2)}
        
        Provide a real-time market analysis in JSON format with these exact fields:
        {{
            "recommended_action": "buy/hold/sell",
            "confidence": <float between 0-1>,
            "rationale": <detailed explanation including price trends and market conditions>,
            "alternate_markets": [<list of 2-3 nearby markets with potentially better prices>],
            "notes": <important insights about market timing, transportation considerations, and storage advice>,
            "price_forecast": <7-day price trend prediction>
        }}
        
        Important: 
        1. Base your analysis on the CURRENT price and market conditions
        2. Consider seasonal factors and local market dynamics
        3. Respond ONLY with valid JSON
        4. Be specific about price movements and market conditions"""

        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text
        start = response_text.find('{')
        end = response_text.rfind('}') + 1
        
        if start == -1 or end == 0:
            return None
            
        json_str = response_text[start:end]
        result = json.loads(json_str)
        
        # Validate required fields
        required_fields = ["recommended_action", "confidence", "rationale", 
                         "alternate_markets", "notes"]
        for field in required_fields:
            if field not in result:
                return None
                
        return result
        
    except Exception as e:
        print(f"Error getting Gemini advice: {str(e)}")
        return None

async def analyze_market(crop_name: str, region: str) -> Dict:
    """
    Analyze market conditions for a crop in a specific region.
    
    Args:
        crop_name (str): Name of the crop
        region (str): Region/state name
        
    Returns:
        Dict: Combined analysis from Perplexity and Gemini
    """
    # Get price trends from Perplexity
    trend_info = await query_perplexity_for_price_trends(crop_name, region)
    
    if not trend_info:
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch price trend data. Service temporarily unavailable."
        )
    
    # Get market advice from Gemini
    advice = await ask_gemini_for_advice(crop_name, region, trend_info)
    
    # Prepare response
    response = {
        "crop_name": crop_name,
        "region": region,
        "trend_info": trend_info,
        "sources": ["perplexity"]
    }
    
    # Add Gemini advice if available
    if advice:
        response.update({
            "recommended_action": advice["recommended_action"],
            "confidence": advice["confidence"],
            "rationale": advice["rationale"],
            "alternate_markets": advice["alternate_markets"],
            "notes": advice["notes"],
            "sources": ["perplexity", "gemini"]
        })
        
    return response
