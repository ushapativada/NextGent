from fastapi import FastAPI
from app.api.stakeholder import router as stakeholder_router
from app.api.validator import router as validator_router
from app.api.output import router as output_router
from app.api.developer import router as developer_router
from app.api.visualization import router as visualization_router
from app.api.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Virtual SDLC Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True if not ["*"] else False, # Cannot be True if allow_origins=['*']
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stakeholder_router)
app.include_router(validator_router)
app.include_router(output_router)
app.include_router(developer_router)
app.include_router(visualization_router)
app.include_router(auth_router)
