# Planova AI - AI-Powered Content Strategy Engine

**Planova AI** is a full-stack MERN application designed to be a comprehensive content strategy generator. It empowers users to create detailed, data-driven content plans by analyzing real-time trends, tracking competitors, and leveraging the power of Google's Gemini AI.

This tool moves beyond simple content generation by building a complete strategic blueprint, from understanding the target audience with AI-generated personas to laying out a day-by-day content calendar.

## ✨ Core Features

*   **🤖 AI Strategy Generation**: Input your target audience, topic, and goals to generate a complete content calendar, including post titles, formats, platforms, and optimal timing.
*   **📈 Multi-Source Trend Analysis**: Aggregates and analyzes trending topics from YouTube, Twitter, Reddit, and an AI-powered simulation of Google Trends to ensure content is timely and relevant.
*   **🕵️ Competitor Tracking**: Add competitors from YouTube, Twitter, or Blogs (via RSS) to fetch their latest content and receive an AI-powered analysis of their core themes and strategy.
*   **👤 AI Persona Generation**: Automatically creates a detailed audience persona from simple keywords, providing deep insights into your target user's goals and pain points.
*   **🗓️ Interactive Content Calendar**: View your generated strategy on a dynamic calendar. Edit content ideas, track the status of each post ('To Do', 'In Progress', 'Completed'), and see the AI's rationale for each suggestion.
*   **🔐 User Authentication**: Secure user accounts with JWT authentication ensures that all strategies and competitor lists are private and accessible only to the logged-in user.
*   **💡 Content Idea Bank**: A dedicated space to quickly brainstorm different types of content (blog titles, tweet hooks, video ideas) without generating a full strategy.

## 🚀 Live Demo

[Link to your deployed application] - *(Add your link here when you deploy it)*

## 🛠️ Technology Stack

| Layer        | Technology                                                                                                  |
| :----------- | :---------------------------------------------------------------------------------------------------------- |
| **Frontend** | React, React Router, Tailwind CSS, Axios, Chart.js, Framer Motion                                           |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose, JWT                                                                 |
| **APIs**     | **Google Gemini API**, YouTube Data API v3, Twitter API v2, Reddit RSS                                      |

## ⚙️ Setup and Installation

To run this project locally, you will need to set up both the backend and frontend services.

### Prerequisites

*   Node.js (v18.x or higher recommended)
*   npm
*   MongoDB Atlas Account (for the database)

### 1. Backend Setup

First, navigate to the `Backend` directory and set up the server.

```bash
# Navigate to the backend folder
cd Backend

# Install dependencies
npm install
```

#### **API Keys and Environment Variables**

The backend requires several API keys to function. You need to create a `.env` file in the `Backend` directory and populate it with your keys.

```bash
# In the Backend/ directory
touch .env
```

Open the `.env` file and add the following variables:

```env
# MongoDB Connection String
# Get this from your MongoDB Atlas cluster by clicking "Connect" > "Shell"
MONGO_URI=mongodb+srv://<username>:<password>@yourcluster.mongodb.net/yourDatabaseName

# Google Gemini API Key
# 1. Go to https://ai.google.dev/
# 2. Click "Get API key in Google AI Studio"
# 3. Create a new API key and copy it here.
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# YouTube Data API Key
# 1. Go to the Google Cloud Console: https://console.cloud.google.com/
# 2. Create a new project.
# 3. Enable the "YouTube Data API v3".
# 4. Create credentials for an "API Key" and copy it here.
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY

# Twitter (X) API Bearer Token
# 1. Apply for a developer account at https://developer.twitter.com/
# 2. Create a new Project and a new App.
# 3. In your App's "Keys and tokens" section, generate and copy the "Bearer Token".
TWITTER_BEARER_TOKEN=YOUR_TWITTER_BEARER_TOKEN

# JSON Web Token Secret
# This can be any long, random, and secret string.
JWT_SECRET=your_super_secret_random_string_for_jwt

# Server Port (Optional)
PORT=5000
```

#### **Running the Backend**

Once the `.env` file is configured, you can start the server.

```bash
# Start the backend server
npm start
```

The server should now be running on `http://localhost:5000`.

### 2. Frontend Setup

In a new terminal window, navigate to the `Frontend` directory.

```bash
# Navigate to the frontend folder
cd Frontend

# Install dependencies
npm install
```

#### **Environment Variables**

The frontend only needs to know the URL of the backend API. Create a `.env` file in the `Frontend` directory.

```bash
# In the Frontend/ directory
touch .env
```

Open the file and add the following line:

```env
VITE_API_URL=http://localhost:5000
```

#### **Running the Frontend**

```bash
# Start the frontend development server
npm run dev
```

Your browser should automatically open to `http://localhost:5173`, and the application will be running.

## 📝 API Endpoints

*   **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
*   **Strategies**: `GET /api/strategy`, `POST /api/strategy/generate`, `GET /api/strategy/:id`, `DELETE /api/strategy/:id`
*   **Competitors**: `GET /api/competitors`, `POST /api/competitors`
*   **Trends**: `GET /api/trends`
*   **Idea Bank**: `POST /api/strategy/generate-ideas`
