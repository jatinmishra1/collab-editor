from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from routers import documents, users, shares, upload
from routers.users import seed_users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    seed_users(db)
    yield
    # Shutdown (nothing needed)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(shares.router, prefix="/api/shares", tags=["shares"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
