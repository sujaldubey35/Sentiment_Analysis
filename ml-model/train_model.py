import pandas as pd
import pickle
import re

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, classification_report

# load dataset
data = pd.read_csv("dataset.csv")

# basic cleaning
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text

data["review"] = data["review"].apply(clean_text)

X = data["review"]
y = data["sentiment"]

# TF-IDF with unigrams + bigrams
vectorizer = TfidfVectorizer(
    ngram_range=(1,2),
    stop_words="english",
    max_features=5000
)

X_vec = vectorizer.fit_transform(X)

# stratified split
X_train, X_test, y_train, y_test = train_test_split(
    X_vec,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

# Linear SVM
model = LinearSVC()
model.fit(X_train, y_train)

# evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print("Model Accuracy:", round(acc*100,2), "%")
print("\nDetailed Report:\n", classification_report(y_test, y_pred))

# save
pickle.dump(model, open("model.pkl","wb"))
pickle.dump(vectorizer, open("vectorizer.pkl","wb"))

print("Model trained and saved successfully")