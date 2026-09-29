import os
import uuid
import shutil
from abc import ABC, abstractmethod
from fastapi import UploadFile, HTTPException
from app.core.config import settings


class FileStorageInterface(ABC):
    @abstractmethod
    def save_file(self, file: UploadFile, directory: str = "") -> str:
        """Saves a file and returns its secure storage identifier/path"""
        pass

    @abstractmethod
    def get_file_path(self, file_id: str) -> str:
        """Returns the full path or URL to access the file"""
        pass

    @abstractmethod
    def delete_file(self, file_id: str) -> bool:
        """Deletes a file given its identifier"""
        pass

    def validate_file(self, file: UploadFile):
        """Validates MIME type, extension, and file size"""
        # Validate MIME type
        if file.content_type not in settings.ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_DOCUMENT_TYPES)}",
            )

        # Validate file size (if the underlying file supports seeking)
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)  # Reset pointer

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB",
            )


class LocalStorage(FileStorageInterface):
    def __init__(self):
        self.base_dir = os.path.join(os.getcwd(), settings.UPLOAD_DIR)
        os.makedirs(self.base_dir, exist_ok=True)

    def save_file(self, file: UploadFile, directory: str = "") -> str:
        self.validate_file(file)

        # Generate secure unique ID
        ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
        # Extra safety for extension
        if not ext and file.content_type == "application/pdf":
            ext = ".pdf"
        elif not ext and file.content_type == "image/jpeg":
            ext = ".jpg"
        elif not ext and file.content_type == "image/png":
            ext = ".png"

        secure_filename = f"{uuid.uuid4()}{ext}"

        # Determine target directory
        target_dir = (
            os.path.join(self.base_dir, directory) if directory else self.base_dir
        )
        os.makedirs(target_dir, exist_ok=True)

        file_path = os.path.join(target_dir, secure_filename)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return relative path to be stored in DB
        return os.path.join(directory, secure_filename).replace("\\", "/")

    def get_file_path(self, file_id: str) -> str:
        return os.path.join(self.base_dir, file_id)

    def delete_file(self, file_id: str) -> bool:
        file_path = self.get_file_path(file_id)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False


class CloudStorage(FileStorageInterface):
    def save_file(self, file: UploadFile, directory: str = "") -> str:
        self.validate_file(file)
        # TODO: Implement AWS S3 / GCP Storage logic here
        raise NotImplementedError("Cloud storage is not implemented yet")

    def get_file_path(self, file_id: str) -> str:
        # TODO: Return signed URL
        raise NotImplementedError("Cloud storage is not implemented yet")

    def delete_file(self, file_id: str) -> bool:
        raise NotImplementedError("Cloud storage is not implemented yet")


# Factory pattern to get the active storage engine
def get_storage_service() -> FileStorageInterface:
    if settings.STORAGE_TYPE.lower() == "cloud":
        return CloudStorage()
    return LocalStorage()


storage_service = get_storage_service()
