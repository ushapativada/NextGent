# NextGent (ReqArchitect) - AI-Powered Requirements Engineering Platform

NextGent is a cutting-edge platform designed to automate and streamline the Software Development Life Cycle (SDLC) by acting as an AI-powered Requirements Architect. It leverages multi-agent AI systems to interview stakeholders, refine problem statements, and automatically generate comprehensive technical specifications and UML diagrams.

## 🚀 Key Features

*   **Interactive Stakeholder Interviews**: An AI agent dynamically questions stakeholders to extract clear, unambiguous business requirements.
*   **Automated Requirement Refinement**: Raw stakeholder inputs are automatically processed by a dedicated AI crew to produce clean, precise problem definitions and identify constraints/assumptions.
*   **Technical Specification Generation**: An AI Developer agent automatically drafts detailed markdown-based technical specs (functional/non-functional requirements) tailored exactly to the refined scope.
*   **Automated Architectural Visualization**: The platform leverages `PlantUML` syntax generation to automatically draft four essential system models:
    *   Use Case Diagrams
    *   Activity Diagrams
    *   Sequence Diagrams
    *   Class Diagrams
*   **Stakeholder Feedback Loop**: Stakeholders can seamlessly inject feedback on generated SRS documents, visually flagging projects as "Needs Revision" for strict developer integration upon the next generation cycle.
*   **Dynamic PDF Exporting**: Instantly compile downloadable PDF Software Requirements Specifications (SRS) customized with live dynamic project titles and embedded visual diagrams.

---

## 🏗️ Architecture Stack

### Backend (NextGentService)
*   **Framework**: FastAPI (Python)
*   **Database**: MongoDB (via `pymongo`)
*   **AI Orchestration**: `CrewAI` & Direct LLM Inference
*   **PDF Generation**: `fpdf`
*   **Diagrams**: PlantUML Server Integration

### Frontend (client)
*   **Framework**: React 18 + Vite
*   **Styling**: Tailwind CSS + Framer Motion (Animations)
*   **Routing**: React Router DOM (v6)
*   **Markdown Parsing**: `react-markdown`

---

## 📂 Project Structure

### `/NextGentService/app` (Backend)
*   **`/api`**: FastAPI routers defining the core endpoints (`/stakeholder`, `/validator`, `/developer`, `/output`, `/auth`).
*   **`/agents`**: Isolated definitions for individual AI roles (e.g., Questioning, Refining, Visualization, Developer).
*   **`/crew`**: `CrewAI` definitions wiring multiple agents into coherent pipelines.
*   **`/services`**: Core business logic modules (session orchestration, constraints extraction, document builders).
*   **`/state`**: MongoDB interaction layer (`session_store.py`) handling all session persistence.
*   **`/utils`**: Helper modules (`pdf_generator.py` and `plantuml_generator.py`).

### `/client/src` (Frontend)
*   **`/components`**: Primary application views and layouts (Dashboard, Developer Workspace, Output Viewers).
*   **`/UI`**: Reusable low-level React components (Chat bubbles, Badges, Markdown viewers).
*   **`/pages`**: Top-level route containers like the Auth Login or User Profile hub.

---

## ⚙️ Setup & Installation

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   MongoDB instance running locally on `mongodb://localhost:27017/`

### 1. Backend Setup
```bash
cd NextGentService
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate # Mac/Linux
pip install -r requirements.txt
python run.py
```
*The backend will boot up at `http://127.0.0.1:8000`*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*The frontend will boot up at `http://localhost:5173`*

---

## 🔄 The SDLC Workflow

1.  **Questioning**: Stakeholders initiate a project. The AI interviews them until the scope is sufficiently clear.
2.  **Refining**: The AI summarizes the conversation, generating a dynamic project title and defining in-scope/out-of-scope rules.
3.  **Validating**: The Stakeholder reviews the refined problem. If approved, the project transitions to the Developer.
4.  **Developing**: The Developer views the problem and uses the AI to draft Technical Specifications.
5.  **Visualizing**: The Developer executes the Visualization pipeline to generate the four standard UML diagrams.
6.  **Review (Feedback)**: The Stakeholder reviews the output and provides feedback. The Developer regenerates the specs directly incorporating the requested constraints.
7.  **Exporting**: The finalized SRS document is compiled into a polished PDF for download.
