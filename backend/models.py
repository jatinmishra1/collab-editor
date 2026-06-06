from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)

    owned_documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    shared_documents = relationship("DocumentShare", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text, default="<p>Start writing...</p>")
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="owned_documents")
    # BUG FIX: cascade delete so shares are removed when document is deleted
    shares = relationship("DocumentShare", back_populates="document", cascade="all, delete-orphan")

class DocumentShare(Base):
    __tablename__ = "document_shares"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    user_email = Column(String, ForeignKey("users.email"))
    permission = Column(String, default="viewer")

    document = relationship("Document", back_populates="shares")
    user = relationship("User", back_populates="shared_documents")
