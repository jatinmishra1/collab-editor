from pydantic import BaseModel, ConfigDict
from typing import List

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class DocumentShareBase(BaseModel):
    document_id: int
    user_email: str

class DocumentShareCreate(DocumentShareBase):
    pass

class DocumentShare(DocumentShareBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class DocumentBase(BaseModel):
    title: str
    content: str

class DocumentCreate(DocumentBase):
    owner_email: str

class DocumentUpdate(BaseModel):
    title: str
    content: str

class Document(DocumentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int
    shares: List[DocumentShare] = []
