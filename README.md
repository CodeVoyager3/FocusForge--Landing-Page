<div align="center">
  <img src="https://via.placeholder.com/150x150/0f172a/6366f1?text=FF" alt="FocusForge Logo" width="120" />
  
  # FocusForge
  
  **The ultimate AI-adaptive learning platform.** <br>
  *Just-In-Time curriculum generation, deeply integrated learning profiles, and stunning metrics.*

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)

</div>

---

## 🚀 Overview

**FocusForge** is a premium, enterprise-grade AI learning engine designed to replace rigid online courses. Instead of a pre-recorded path, FocusForge dynamically generates a tailored curriculum using Large Language Models (LLMs) the moment you type in what you want to learn.

It doesn't stop there—our **Just-In-Time (JIT) Sourcing Engine** automatically crawls YouTube to find the best, most relevant educational videos for each subtopic, filtering by engagement, recency, and your personal "Trusted Creators" algorithmic profile. 

It then watches the video, generates dynamic assessments, and grades you instantly. 

---

## 🔥 Key Features

- **Just-In-Time (JIT) Curriculum Generation:** Type any topic (e.g., "Quantum Computing") and an LLM instantly writes a 5-module, 25-subtopic syllabus perfectly tailored to your skill level.
- **Smart Video Sourcing:** Automagically sources the best YouTube content for each granular subtopic. 
- **The "Trusted Creators" Loop:** The platform learns which instructors you succeed with (by passing their quizzes) and forcefully prioritizes their content in your future courses.
- **AI-Powered Assessments:** Automatically transcribes video lessons and generates multiple-choice quizzes to ensure you retained the material.
- **Premium Dark-Mode Glassmorphism UI:** Built with Framer Motion and Magic UI, the platform features highly immersive glowing orbs, zig-zag roadmaps, and silky-smooth animations.
- **Activity Streaks:** A gamified dashboard tracking your daily momentum, completed modules, and overall progress.

---

## 🏗 System Architecture

FocusForge operates entirely decoupled. The React frontend interacts with a specialized Express/Node engine that acts as an orchestration gateway to LLMs and the YouTube API.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS | Blistering fast rendering, immersive Glassmorphism UI. |
| **Auth** | Clerk | Instant, secure user authentication and management. |
| **API Gateway** | Node.js, Express | Handles requests, background scraping, and LLM polling. |
| **Data Layer** | MongoDB, Mongoose | Stores generated courses, user activity streaks, and trusted creator weights. |
| **AI Inference** | Gemini / OpenAI APIs | Structures complex nested JSON syllabuses and quiz sets. |

---

## 🛠 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/CodeVoyager3/FocusForge.git
cd FocusForge

# Install Backend
cd backend
npm install

# Install Frontend
cd ../Frontend
npm install
```

### 2. Environment Variables
You will need `.env` files in both directories.

**Backend (`backend/.env`):**
```env
PORT=3000
MONGODB_URI=your_mongo_url
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_v3_key
```

**Frontend (`Frontend/.env`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Run the Platform
Start both servers concurrently.
```bash
# Terminal 1 (Backend)
cd backend
nodemon server.js

# Terminal 2 (Frontend)
cd Frontend
npm run dev
```

---

<div align="center">
  <i>Built with 💡 during hackathon mode.</i>
</div>
