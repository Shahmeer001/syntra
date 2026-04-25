# Syntra

Syntra is a comprehensive platform featuring a FastAPI backend and a Vite-React frontend. It provides a multi-agent system workspace with meeting management, agent configurations, and billing features.

## Features

- **Workspaces:** Organize your projects, teams, and agents.
- **Agent Management:** Configure and deploy AI agents for various tasks.
- **Meetings:** Seamless meeting management and integrations.
- **Billing:** Built-in billing configurations.

## Technology Stack

- **Frontend:** React, Vite
- **Backend:** FastAPI, Python
- **Database:** Supabase

## Getting Started

### Prerequisites
- Node.js
- Python 3.8+

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shahmeer001/syntra.git
   cd syntra
   ```

2. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   cd server
   pip install -r requirements.txt # or use your package manager
   uvicorn main:app --reload --port 8000
   ```

## License
MIT
