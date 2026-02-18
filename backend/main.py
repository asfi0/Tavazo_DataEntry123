import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TAVAAZO Pricing Intelligence Backend")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StrategyRequest(BaseModel):
    sku_name: str
    country: str
    cost: float
    sell_in: float
    retail_price: float
    anchor_brand: str
    anchor_median: float
    anchor_lower: float
    anchor_upper: float
    distributor_margin: float
    retailer_margin: float

@app.post("/ai/strategy")
async def get_strategy(req: StrategyRequest):
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API_KEY not configured on server")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        prompt = f"""
        Role: Senior FMCG Pricing Strategist for TAVAAZO.
        Market: {req.country}
        SKU: {req.sku_name}
        Proposed SRP: €{req.retail_price:.2f}
        Anchor ({req.anchor_brand}) Median: €{req.anchor_median:.2f}
        
        Task: Provide 2-3 sentences of tactical pricing advice regarding the price gap and margin.
        """
        
        response = model.generate_content(prompt)
        return {
            "strategy_text": response.text,
            "model_used": "gemini-3-flash-preview"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
