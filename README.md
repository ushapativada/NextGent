# NextGent - AI-Powered Requirements Architect

NextGent is a sophisticated full-stack application designed to automate and enhance requirements engineering using advanced AI agents. It leverages a modern web stack combined with powerful LLM interactions to analyze, validate, and generate system requirements.

## 🚀 Technology Stack

### Frontend (`/client`)
Built with modern web technologies for a responsive and dynamic user experience:
- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend (`/NextGentService`)
A robust Python-based API service powering the AI logic:
- **API Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **AI Agents:** [CrewAI](https://www.crewai.com/)
- **LLM Integration:** [LiteLLM](https://docs.litellm.ai/), [Instructor](https://python.useinstructor.com/)
- **Vector Database:** [ChromaDB](https://www.trychroma.com/)
- **Document Processing:** PDFMiner, PyPDFium2
- **Async Support:** `trio`, `aiohttp`

## 📂 Project Structure

```
NextGentMain/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Validation, Output)
│   │   ├── Layouts/        # Page Layouts
│   │   └── assets/         # Static Assets
│   └── package.json
│
└── NextGentService/        # Backend Python Service
    ├── app/
    │   ├── agents/         # AI Agent Definitions
    │   ├── crew/           # CrewAI Orchestration Logic
    │   ├── api/            # FastAPI Endpoints
    │   └── services/       # Core Business Logic
    ├── venv/               # Virtual Environment
    └── requirements.txt    # Python Dependencies
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
Navigate to the service directory and set up the Python environment.

```powershell
cd NextGentService

# Create and Activate Virtual Environment (Windows)
.\env.bat
# OR manually:
# python -m venv venv
# .\venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt

# Run the Server
python run.py
```

### 2. Frontend Setup
Navigate to the client directory to install dependencies and start the dev server.

```powershell
cd client

# Install Node Modules
npm install

# Start Development Server
npm run dev
```

The frontend will typically be available at `http://localhost:5173` and the backend documentation at `http://localhost:8000/docs`.

## ✨ Features

- **User Dashboard:** Central hub for managing requirements workflows.
- **AI Validation:** Automated validation of requirement documents using intelligent agents.
- **Smart Output:** Structured output generation for clear and actionable insights.
- **Agentic Workflow:** Utilizes CrewAI to orchestrate multiple AI agents for complex tasks.
