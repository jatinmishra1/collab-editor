from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/", response_model=list[schemas.Document])
def get_documents(user_email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    owned = user.owned_documents
    shared_ids = [share.document_id for share in user.shared_documents]
    shared = db.query(models.Document).filter(models.Document.id.in_(shared_ids)).all()
    return owned + shared

@router.post("/", response_model=schemas.Document)
def create_document(doc: schemas.DocumentCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == doc.owner_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db_doc = models.Document(title=doc.title, content=doc.content, owner_id=user.id)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.get("/{doc_id}", response_model=schemas.Document)
def get_document(doc_id: int, user_email: str = Query(...), db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # BUG FIX: check user exists before accessing user.id (was AttributeError)
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if doc.owner_id != user.id and not any(s.user_email == user_email for s in doc.shares):
        raise HTTPException(status_code=403, detail="Access denied")
    return doc

@router.put("/{doc_id}", response_model=schemas.Document)
def update_document(
    doc_id: int,
    doc_update: schemas.DocumentUpdate,
    user_email: str = Query(...),
    db: Session = Depends(get_db)
):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # BUG FIX: check user exists before accessing user.id
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if doc.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only owner can edit")
    doc.title = doc_update.title
    doc.content = doc_update.content
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: int, user_email: str = Query(...), db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # BUG FIX: check user exists before accessing user.id
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if doc.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only owner can delete")
    # BUG FIX: delete child shares first to avoid FK constraint error
    db.query(models.DocumentShare).filter(
        models.DocumentShare.document_id == doc_id
    ).delete()
    db.delete(doc)
    db.commit()
    return {"ok": True}
