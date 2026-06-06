from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/", response_model=list[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(email=user.email, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def seed_users(db: Session):
    if db.query(models.User).count() == 0:
        users = [
            models.User(email="alice@example.com", name="Alice"),
            models.User(email="bob@example.com", name="Bob"),
            models.User(email="carol@example.com", name="Carol"),
        ]
        db.add_all(users)
        db.commit()