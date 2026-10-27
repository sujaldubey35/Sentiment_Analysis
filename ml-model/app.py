import os
import re
import pickle
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")

app = FastAPI(title="Sentiment Analysis ML API", version="1.0.0")

# Enable CORS for direct frontend/microservice access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        text = str(text) if text is not None else ""
    text = text.lower().strip()
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# Load trained model and vectorizer
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)
    print("Model and vectorizer loaded successfully.")
except Exception as e:
    print(f"Error loading model artifacts: {e}")
    model = None
    vectorizer = None

class Review(BaseModel):
    text: str

@app.get("/")
def home():
    return {
        "service": "Sentiment ML API",
        "status": "running",
        "model_loaded": model is not None and vectorizer is not None
    }

@app.get("/health")
def health():
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded")
    return {"status": "ok"}

@app.post("/predict")
def predict(review: Review):
    if not review.text or not review.text.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty")

    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    cleaned = clean_text(review.text)
    # If cleaning results in empty string (e.g. only symbols), fall back to original stripped text
    if not cleaned:
        cleaned = review.text.strip().lower()

    # Convert text to vector
    text_vector = vectorizer.transform([cleaned])

    # Prediction
    prediction = str(model.predict(text_vector)[0]).lower()

    # Calculate confidence score
    score = 0.0
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(text_vector)[0]
        score = round(float(max(probabilities)) * 100, 2)
    elif hasattr(model, "decision_function"):
        import numpy as np
        decision = model.decision_function(text_vector)[0]
        # Softmax approximation of decision function
        exp_d = np.exp(decision - np.max(decision))
        probs = exp_d / exp_d.sum()
        score = round(float(np.max(probs)) * 100, 2)
    else:
        score = 85.0

    return {
        "review": review.text,
        "sentiment": prediction,
        "score": score
    }