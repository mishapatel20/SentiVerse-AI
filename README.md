# 🧠 SentiVerse AI

### AI-Powered E-Commerce Review Sentiment Analysis Platform

SentiVerse AI is an intelligent web-based platform designed to analyze e-commerce product reviews using **Natural Language Processing (NLP)** and **Machine Learning**. The system classifies reviews into **Positive, Negative, or Neutral** sentiments and provides additional insights such as emotion analysis, fake review detection, prediction history, and data visualization.

---

## 📌 Project Overview

Online shopping platforms generate a large amount of customer feedback every day. Manually analyzing these reviews is time-consuming and difficult.

**SentiVerse AI** solves this problem by automatically processing customer reviews and generating meaningful insights using NLP and Machine Learning techniques.

The platform allows users to:

- Analyze individual product reviews
- Upload CSV files for bulk review analysis
- Predict review sentiment
- Analyze emotions expressed in reviews
- Detect potentially fake or spam reviews
- View prediction history
- Visualize sentiment statistics
- Export analysis results as PDF reports

---

## ✨ Key Features

### 🔐 User Authentication
- User registration
- Secure login
- JWT-based authentication
- Protected application routes

### 📝 Single Review Analysis
Enter an individual product review and receive:

- Sentiment prediction
- Confidence score
- Positive / Negative / Neutral classification

### 📊 Bulk CSV Analysis
Upload multiple product reviews through a CSV file and process them simultaneously.

### 😊 Emotion Analysis
Analyzes the emotional characteristics of a review and identifies emotions such as:

- Joy
- Anger
- Fear
- Sadness
- Surprise

### 🛡️ Fake Review Detection
Identifies potentially fake, biased, or spam reviews using rule-based and machine-learning-based analysis techniques.

### 📈 Dashboard
The dashboard provides an overview of analyzed reviews through:

- Total review count
- Positive reviews
- Negative reviews
- Neutral reviews
- Average confidence
- Sentiment distribution
- Monthly sentiment trends
- Recent predictions

### 🕒 Prediction History
Stores previously analyzed reviews and allows users to review their:

- Review text
- Predicted sentiment
- Confidence score
- Analysis timestamp

### 📄 PDF Report Export
Users can generate PDF reports containing sentiment analysis results and related insights.

---

## 🏗️ System Workflow

```text
User Registration
       ↓
     Login
       ↓
   Dashboard
       ↓
Review Input / CSV Upload
       ↓
  Review Processing
       ↓
Sentiment Prediction
       ↓
   Result Display
       ↓
 Report Export
       ↓
     Logout
