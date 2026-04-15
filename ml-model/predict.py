import pickle

model = pickle.load(open("model.pkl","rb"))
vectorizer = pickle.load(open("vectorizer.pkl","rb"))

def predict_sentiment(text):

    text_vector = vectorizer.transform([text])

    prediction = model.predict(text_vector)

    return prediction[0]