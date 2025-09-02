from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from .config import get_settings
from .routes.auth_routes import router as auth_router
from .routes.protected_routes import router as protected_router

settings = get_settings()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(protected_router)

@app.get("/")
def root():
    return {"ok": True}
