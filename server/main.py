from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from routers import workspaces, agents, tasks, collaboration, meeting, billing
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), "outputs")

app = FastAPI(
    title="Syntra API",
    description="Multi-Agent AI Business OS",
    version="1.0.0"
)

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


# ============================================
# File Download Endpoint
# ============================================
@app.get("/outputs/{filename}")
async def download_output_file(filename: str):
    """
    Serve a generated report file for download.
    Called when user clicks Download in the Task Detail Modal.
    """
    # Sanitize filename — no path traversal
    filename = os.path.basename(filename)
    filepath = os.path.join(OUTPUTS_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found")

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/outputs")
async def list_output_files():
    """List all generated files in the outputs folder."""
    try:
        os.makedirs(OUTPUTS_DIR, exist_ok=True)
        files = [
            f for f in os.listdir(OUTPUTS_DIR)
            if not f.startswith(".") and os.path.isfile(os.path.join(OUTPUTS_DIR, f))
        ]
        return {"files": sorted(files, reverse=True)}
    except Exception as e:
        raise HTTPException(500, str(e))


# ============================================
# Health Check
# ============================================
@app.get("/")
async def root():
    return {
        "app": "Syntra",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "syntra-api"}


@app.on_event("startup")
async def startup():
    os.makedirs(OUTPUTS_DIR, exist_ok=True)
    logger.info("🚀 Syntra API starting up...")
    logger.info("✅ All systems operational")


@app.on_event("shutdown")
async def shutdown():
    logger.info("🛑 Syntra API shutting down...")