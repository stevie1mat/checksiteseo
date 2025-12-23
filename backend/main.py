from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import analyze_readiness

app = FastAPI(title="AEO Readiness Auditor")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for MVP dev, or restrict to localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    url: str

@app.get("/")
def read_root():
    return {"message": "AEO Readiness Auditor API is running"}

@app.post("/analyze")
async def analyze_url(request: AnalyzeRequest):
    result = await analyze_readiness(request.url)
    return result
