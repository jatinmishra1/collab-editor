import markdown
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    owner_email: str = Form(...),
    db: Session = Depends(get_db)
):
    allowed = ["txt", "md"]
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only .txt and .md files are supported")

    contents = await file.read()
    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded text")

    if ext == "md":
        # BUG FIX: use only the base extension, not 'extra' which may not be installed
        html_content = markdown.markdown(text)
    else:
        # BUG FIX: proper paragraph splitting instead of single <p> wrapping everything
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if paragraphs:
            html_content = "".join(
                f"<p>{para.replace(chr(10), '<br>')}</p>" for para in paragraphs
            )
        else:
            html_content = "<p>Start writing...</p>"

    user = db.query(models.User).filter(models.User.email == owner_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Strip extension from title
    title = file.filename.rsplit(".", 1)[0] if "." in file.filename else file.filename

    doc = models.Document(
        title=title,
        content=html_content,
        owner_id=user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    # BUG FIX: return content so frontend can populate the doc immediately
    return {"id": doc.id, "title": doc.title, "content": doc.content}
