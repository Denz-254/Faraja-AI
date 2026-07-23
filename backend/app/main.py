from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, checkin, history, responses
from app.core.config import settings

app = FastAPI(title="Faraja API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(checkin.router)
app.include_router(history.router)
app.include_router(responses.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
