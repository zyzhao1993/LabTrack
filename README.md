# LabTrack

**LabTrack** is a full-stack task management app tailored for researchers. It helps manage, track, and prioritize lab tasks with user authentication, real-time updates, and intelligent task recommendations.

## Features

- 📝 Create, update, and reorder todos
- ✅ Mark tasks as completed with timestamps
- 🔐 JWT-based user authentication
- 🧠 Twin-Tower recommendation system (FastAPI microservice)
- 🚀 Dockerized with `docker-compose`
- ☁️ Ready for deployment on AWS EC2
- 🧪 CI/CD pipeline integration with GitHub Actions (optional)
- 🎨 UI designed with React and Tailwind CSS

## Project Structure
```
LabTrack/
├── client/                # Frontend (React + Vite)
├── api/                   # Backend API (Node.js + Express + MongoDB)
├── recommend_service/     # FastAPI microservice for task recommendation
├── docker-compose.yml     # Compose config to run all services
```

## Quick Start (Local)

1. Clone the repo  
   ```bash
   git clone https://github.com/your-username/LabTrack.git
   cd LabTrack
   ```

2. Create a `.env` file in `api/` with your MongoDB Atlas URI:  
   ```
   MONGO_URI=your_mongo_connection_string
   ```

3. Start all services with Docker:
   ```bash
   docker-compose up --build
   ```

4. Visit the app at `http://localhost:5173`

## Recommendation Service API

- **POST** `/recommend`
- **Body:**
  ```json
  {
    "user_history": ["Task A", "Task B"],
    "all_items": ["Task A", "Task B", "Task C", "Task D"]
  }
  ```
- **Returns:** top-5 similar items not in history

## Tech Stack

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Microservice: FastAPI, SentenceTransformer
- DevOps: Docker, Docker Compose, GitHub Actions (optional)

---

