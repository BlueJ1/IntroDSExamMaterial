"""
Mock exam_extras module for solving the exam problems.
This provides mock data and functions when the real exam_extras is not available.
"""

import random
import math

def load_sms():
    """
    Load SMS spam data.
    Returns a list of tuples: (text, label) where label is 0 (not spam) or 1 (spam)

    This is a mock function - in the real exam, this would load actual data.
    We'll create sample data that mimics the real dataset structure.
    """
    # Mock SMS data - in reality this would be loaded from a file
    # The SMS Spam Collection Dataset has about 5572 messages
    mock_data = [
        ("Congratulations! You've won a FREE prize! Call now!", 1),
        ("Hey, are you coming to the party tonight?", 0),
        ("FREE entry to win cash prizes! Text WIN to 12345", 1),
        ("Meeting at 3pm tomorrow, please confirm.", 0),
        ("You have won FREE tickets! Claim your prize now!", 1),
        ("Can you pick up milk on your way home?", 0),
        ("URGENT! Your account needs verification. Click here.", 1),
        ("Happy birthday! Hope you have a great day!", 0),
        ("Free free free! Double free offer today only!", 1),
        ("Thanks for dinner last night, it was lovely.", 0),
    ] * 500  # Repeat to simulate larger dataset

    random.seed(42)
    random.shuffle(mock_data)

    return mock_data


def load_sms_problem6():
    """Load SMS data for problem 6 - returns features and labels"""
    data = load_sms()
    X = [text for text, label in data]
    Y = [label for text, label in data]
    return X, Y


def train_test_split(X, Y, test_size=0.25, random_state=42):
    """Simple train-test split"""
    random.seed(random_state)
    n = len(X)
    indices = list(range(n))
    random.shuffle(indices)

    split_idx = int(n * (1 - test_size))
    train_idx = indices[:split_idx]
    test_idx = indices[split_idx:]

    X_train = [X[i] for i in train_idx]
    X_test = [X[i] for i in test_idx]
    Y_train = [Y[i] for i in train_idx]
    Y_test = [Y[i] for i in test_idx]

    return X_train, X_test, Y_train, Y_test


def knn_predictions(X_train, Y_train, X_test, k=4):
    """
    Mock KNN predictions based on simple keyword matching.
    In reality, this would use proper feature extraction and KNN.
    """
    predictions = []
    spam_keywords = ['free', 'prize', 'win', 'urgent', 'congratulations', 'click']

    for text in X_test:
        text_lower = text.lower()
        score = sum(1 for kw in spam_keywords if kw in text_lower)
        predictions.append(1 if score >= 2 else 0)

    return predictions


if __name__ == "__main__":
    # Test the functions
    data = load_sms()
    print(f"Loaded {len(data)} SMS messages")
    print(f"Sample: {data[0]}")

    X, Y = load_sms_problem6()
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y)
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    predictions = knn_predictions(X_train, Y_train, X_test)
    print(f"Predictions: {predictions[:10]}")

