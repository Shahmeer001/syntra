from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import workspaces, agents, tasks, collaboration, meeting, billing
 
app = FastAPI(title="Syntra API", description="Multi-Agent AI Business OS", version="1.0.0")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(workspaces.router)
app.include_router(agents.router)
app.include_router(tasks.router)
app.include_router(collaboration.router)
app.include_router(meeting.router)
app.include_router(billing.router)
 
 
@app.get("/")
async def root():
    return {"app": "Syntra", "version": "1.0.0", "status": "running"}
 
@app.get("/health")
async def health():
    return {"status": "ok"}