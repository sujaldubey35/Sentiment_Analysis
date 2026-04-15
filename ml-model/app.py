from fastapi import FastAPI
from pydantic import BaseModel
import pickle

app = FastAPI()

# load trained model and vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

class Review(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "Sentiment ML API running"}


@app.post("/predict")
def predict(review: Review):

    # convert text to vector
    text_vector = vectorizer.transform([review.text])

    # prediction
    prediction = model.predict(text_vector)[0]

    # probability (confidence score)
    probabilities = model.predict_proba(text_vector)[0]

    score = round(max(probabilities) * 100, 2)

    return {
        "review": review.text,
        "sentiment": prediction,
        "score": score
    }