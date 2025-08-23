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

class SchemeAdvisorError(Exception):
    """Custom exception for scheme advisor service errors"""
    pass

async def refine_user_request_with_gemini(user_input: dict) -> str:
    """
    Takes user-provided input and converts it into a clear and specific query
    for Government agriculture schemes using Gemini.
    
    Args:
        user_input (dict): User-provided information including region, crop, farm size, and need
        
    Returns:
        str: A refined query string for searching government schemes
        
    Raises:
        SchemeAdvisorError: If there's an error processing the request with Gemini
    """
    try:
        prompt = f"""You are a prompt-engineering assistant. Convert this user request into a clear and specific query for Government agriculture schemes.

User information:
Farmer name: {user_input.get('farmer_name', 'Unknown')}
Region: {user_input.get('region', 'Unknown')}
Crop: {user_input.get('crop', 'Unknown')}
Farm size: {user_input.get('farm_size', 'Unknown')}
Need: {user_input.get('need', 'Unknown')}

Respond ONLY with a clear, concise search query to find the most relevant government schemes (no explanations).
"""
        
        response = model.generate_content(prompt)
        
        if not response.text:
            logger.error("Empty response from Gemini for query refinement")
            raise SchemeAdvisorError("Failed to process query")
            
        # Clean and return the refined query
        refined_query = response.text.strip()
        logger.info(f"Refined query: {refined_query}")
        
        return refined_query
        
    except Exception as e:
        logger.error(f"Error in refine_user_request_with_gemini: {str(e)}")
        raise SchemeAdvisorError(f"Failed to refine query: {str(e)}")

async def query_perplexity_for_schemes(query: str) -> Optional[Dict]:
    """
    Query Perplexity API for relevant government agriculture schemes.
    
    Args:
        query (str): The refined query string from Gemini
        
    Returns:
        Optional[Dict]: JSON object containing scheme information or None on failure
        
    Raises:
        SchemeAdvisorError: If there's an error querying Perplexity API
    """
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    perplexity_query = f"""Search for the following government agriculture scheme information: 
    {query}
    
    Provide detailed information on:
    1. Scheme names and descriptions
    2. Eligibility criteria
    3. Benefits offered
    4. Application process
    5. Official government links
    
    Return ONLY valid JSON with this structure:
    {{
      "schemes": [
        {{
          "scheme_name": "string",
          "description": "string",
          "eligibility": "string",
          "benefits": "string",
          "application_process": "string",
          "official_link": "string"
        }}
      ],
      "source": "string"
    }}
    
    Include at least 2-3 schemes if available."""
    
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
                    if not isinstance(result.get("schemes"), list) or len(result["schemes"]) == 0:
                        logger.warning("Invalid or empty schemes list in Perplexity response")
                        if attempt == max_retries - 1:
                            return None
                        continue
                    
                    logger.info(f"Successfully fetched {len(result['schemes'])} schemes from Perplexity")
                    return result
                else:
                    logger.warning("No valid JSON found in Perplexity response")
                    if attempt == max_retries - 1:
                        return None
            
        except (httpx.RequestError, json.JSONDecodeError, KeyError) as e:
            logger.error(f"Error querying Perplexity API on attempt {attempt + 1}: {str(e)}")
            if attempt == max_retries - 1:
                raise SchemeAdvisorError(f"Failed to query Perplexity: {str(e)}")
        
        # Wait before retrying with exponential backoff
        if attempt < max_retries - 1:
            await asyncio.sleep(2 ** attempt)
    
    return None

async def expand_scheme_info_with_gemini(perplexity_data: dict, user_input: dict) -> Optional[Dict]:
    """
    Expand scheme information using Gemini 2.5 Flash to provide personalized recommendations.
    
    Args:
        perplexity_data (dict): Data from Perplexity API
        user_input (dict): Original user input
        
    Returns:
        Optional[Dict]: Expanded scheme information with personalized recommendations
        
    Raises:
        SchemeAdvisorError: If there's an error processing with Gemini
    """
    try:
        # Format the user profile and scheme data as strings
        user_profile = json.dumps(user_input, indent=2)
        scheme_data = json.dumps(perplexity_data, indent=2)
        
        prompt = f"""You are a government agriculture scheme advisor. 
Based on the following user profile and scheme data, generate a detailed JSON response:

User Profile: {user_profile}
Scheme Data: {scheme_data}

Required Output JSON:
{{
  "matched_schemes": [
    {{
      "name": "string",
      "description": "string",
      "eligibility": "string",
      "benefits": "string", 
      "application_process": "string",
      "official_link": "string"
    }}
  ],
  "personalized_recommendation": "string",
  "next_steps": "string"
}}

Notes:
1. For matched_schemes, use the schemes from the Perplexity data
2. For personalized_recommendation, analyze how well each scheme matches the user's specific needs
3. For next_steps, provide clear actionable guidance on what the farmer should do next

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
        required_fields = ["matched_schemes", "personalized_recommendation", "next_steps"]
        for field in required_fields:
            if field not in result:
                logger.error(f"Missing required field in Gemini response: {field}")
                return None
                
        # Validate matched_schemes structure
        if not isinstance(result["matched_schemes"], list) or len(result["matched_schemes"]) == 0:
            logger.error("Invalid or empty matched_schemes list in Gemini response")
            return None
            
        return result
        
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Error in expand_scheme_info_with_gemini: {str(e)}")
        return None

async def analyze_schemes(user_input: dict) -> Dict:
    """
    Orchestrate the complete scheme analysis process.
    
    Args:
        user_input (dict): User-provided information
        
    Returns:
        Dict: Complete scheme analysis with personalized recommendations
        
    Raises:
        SchemeAdvisorError: If there's a critical error in the process
    """
    logger.info(f"Analyzing schemes for user in {user_input.get('region', 'Unknown')}")
    
    # Initialize response structure with defaults
    response = {
        "matched_schemes": [],
        "personalized_recommendation": "",
        "next_steps": "",
        "error": None,
        "sources": []
    }
    
    try:
        # Step 1: Refine user request with Gemini
        refined_query = await refine_user_request_with_gemini(user_input)
        
        # Step 2: Query Perplexity with refined query
        perplexity_data = await query_perplexity_for_schemes(refined_query)
        
        if not perplexity_data:
            response["error"] = "Unable to fetch scheme data. Service temporarily unavailable."
            return response
            
        response["sources"].append("perplexity")
        
        # Step 3: Expand Perplexity output with Gemini 2.5 Flash
        expanded_data = await expand_scheme_info_with_gemini(perplexity_data, user_input)
        
        if expanded_data:
            response.update({
                "matched_schemes": expanded_data["matched_schemes"],
                "personalized_recommendation": expanded_data["personalized_recommendation"],
                "next_steps": expanded_data["next_steps"],
                "sources": ["perplexity", "gemini"]
            })
        else:
            # Fall back to basic data from Perplexity if Gemini expansion fails
            response["matched_schemes"] = perplexity_data.get("schemes", [])
            response["personalized_recommendation"] = "Based on your profile, consider reviewing the schemes listed above."
            response["next_steps"] = "Contact your local agricultural extension office for application assistance."
            response["error"] = "Unable to generate personalized recommendations."
        
    except SchemeAdvisorError as e:
        logger.error(f"Scheme advisor error: {str(e)}")
        response["error"] = str(e)
    except Exception as e:
        logger.error(f"Unexpected error in analyze_schemes: {str(e)}")
        response["error"] = f"An unexpected error occurred: {str(e)}"
    
    return response
