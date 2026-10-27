import os
import re
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(VECTORIZER_PATH, "rb") as f:
    vectorizer = pickle.load(f)

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        text = str(text) if text is not None else ""
    text = text.lower().strip()
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def predict_sentiment(text: str):
    cleaned = clean_text(text)
    if not cleaned:
        cleaned = text.strip().lower()

    text_vector = vectorizer.transform([cleaned])
    prediction = str(model.predict(text_vector)[0]).lower()
    return prediction

if __name__ == "__main__":
    sample = "This is an amazing and fantastic product!"
    print(f"Sample review: '{sample}'")
    print(f"Predicted sentiment: {predict_sentiment(sample)}")