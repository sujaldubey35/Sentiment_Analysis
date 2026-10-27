import os
import re
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")

def clean_text(text):
    if not isinstance(text, str):
        text = "" if pd.isna(text) else str(text)
    text = text.lower().strip()
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def train():
    print(f"Loading dataset from: {DATASET_PATH}")
    data = pd.read_csv(DATASET_PATH)
    data = data.dropna(subset=["review", "sentiment"])

    data["clean_review"] = data["review"].apply(clean_text)
    # Remove any empty reviews after cleaning
    data = data[data["clean_review"].str.len() > 0]

    X = data["clean_review"]
    y = data["sentiment"]

    # TF-IDF vectorizer (ngram 1-2, preserving negation and sentiment markers)
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_features=5000
    )
    X_vec = vectorizer.fit_transform(X)

    # Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_vec,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y
    )

    # Calibrated LinearSVC provides both high classification accuracy and predict_proba support
    base_svc = LinearSVC(dual="auto", random_state=42, max_iter=2000)
    model = CalibratedClassifierCV(estimator=base_svc, cv=3)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {round(acc * 100, 2)}%")
    print("\nDetailed Report:\n", classification_report(y_test, y_pred))

    # Save trained model and vectorizer
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)

    print(f"Model and vectorizer saved successfully to {BASE_DIR}")

if __name__ == "__main__":
    train()