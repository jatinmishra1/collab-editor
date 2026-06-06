from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.DocumentShare)
def add_share(share: schemas.DocumentShareCreate, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == share.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    user = db.query(models.User).filter(models.User.email == share.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(models.DocumentShare).filter(
        models.DocumentShare.document_id == share.document_id,
        models.DocumentShare.user_email == share.user_email
    ).first()
    if existing:
        return existing
    db_share = models.DocumentShare(document_id=share.document_id, user_email=share.user_email)
    db.add(db_share)
    db.commit()
    db.refresh(db_share)
    return db_share

@router.delete("/{doc_id}/{user_email}")
def remove_share(doc_id: int, user_email: str, db: Session = Depends(get_db)):
    share = db.query(models.DocumentShare).filter(
        models.DocumentShare.document_id == doc_id,
        models.DocumentShare.user_email == user_email
    ).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    db.delete(share)
    db.commit()
    return {"ok": True}