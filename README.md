# NextGent - AI-Powered Requirements Architect

NextGent is a sophisticated full-stack application designed to automate and enhance requirements engineering using advanced AI agents. It leverages a modern web stack combined with powerful LLM interactions to analyze, validate, and generate system requirements.

## 🚀 Technology Stack

### Frontend (`/client`)
Built with modern web technologies for a responsive and premium user experience:
- **Framework:** [React v19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Modern Dark Mode UI)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth micro-interactions
- **Routing:** [React Router](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend (`/NextGentService`)
A robust Python-based API service powering the AI logic:
- **API Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **AI Agents:** [CrewAI](https://www.crewai.com/) orchestrating specialized agents
- **LLM Integration:** [LiteLLM](https://docs.litellm.ai/) with Groq (Llama 3.3 70B)
- **Document Services:** `fpdf2` for professional PDF report generation
- **State Management:** JSON-based session store with UTC tracking

## ✨ Core Features

### 1. Agentic Requirements Engineering
- **Phase 1: Questioning**: Interactive AI agent clarifies the software idea one focused question at a time.
- **Phase 2: Validation**: AI Validator detects ambiguities, missing information, and provides clarity scores.
- **Phase 3: Development Output**: Generates detailed Technical Specifications, assumptions, and risk assessments.

### 2. Modern Profile Workspace
- **Grid Layout**: Responsive dark-themed cards for all your architectural projects.
- **Real-time Renaming**: Inline project title editing directly from the workspace.
- **Smart Sorting**: Filter projects by Newest First, Oldest First, or Status.
- **Status Indicators**: Visual color-coded tracking (Questioning, Validating, Developing, Finalized, In Progress).

### 3. Project Lifecycle Management
- **Lifecycle Control**: Flexible "Exit", "Pause", or "Finish" options to manage project state.
- **Export Options**: 
    - **PDF Generation**: High-quality PDF report generation for Stakeholders and Developers.
    - **Smart Copy**: Instant text-formatting export to clipboard with visual feedback.

## 📂 Project Structure

```
NextGentMain/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # UI components & Page logic
│   │   ├── UI/             # Reusable UI primitives
│   │   └── assets/         # Branding and SVGs
│   └── package.json
│
└── NextGentService/        # Backend Python Service
    ├── app/
    │   ├── agents/         # LLM Agent definitions (BA, Validator, Developer)
    │   ├── api/            # API routing logic
    │   ├── services/       # Core business logic & output builders
    │   └── utils/          # PDF and text helpers
    ├── requirements.txt    # Optimized dependency list
    └── main.py             # Entry point
```

## 🛠️ Setup & Installation

### 1. Backend Setup
Navigate to the service directory and set up the Python environment.

```powershell
cd NextGentService

# Setup environment and install dependencies
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Configure your environment
# Create a .env file with your GROQ_API_KEY
echo "GROQ_API_KEY=your_key_here" > .env

# Run the Server
python run.py
```

### 2. Frontend Setup
```powershell
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.
