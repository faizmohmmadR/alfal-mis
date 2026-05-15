"""
File upload utilities for secure and organized file storage
"""
import os
import uuid
from datetime import datetime
from django.utils.deconstruct import deconstructible
from django.conf import settings


@deconstructible
class UploadPathFactory:
    """
    Factory for generating dynamic upload paths
    
    Usage:
        upload_to = UploadPathFactory('students/photos')
        photo = models.ImageField(upload_to=upload_to)
    
    This will generate paths like:
        media/students/photos/2024/01/15/uuid.jpg
    """
    
    def __init__(self, base_path, include_date=True):
        """
        Initialize upload path factory
        
        Args:
            base_path: Base directory for uploads (e.g., 'students/photos')
            include_date: Whether to include date subdirectories
        """
        self.base_path = base_path
        self.include_date = include_date
    
    def __call__(self, instance, filename):
        """
        Generate upload path
        
        Args:
            instance: Model instance
            filename: Original filename
        
        Returns:
            str: Generated upload path
        """
        # Get file extension
        ext = os.path.splitext(filename)[1].lower()
        
        # Generate UUID-based filename
        unique_filename = f"{uuid.uuid4()}{ext}"
        
        if self.include_date:
            # Include date subdirectories
            date_path = datetime.now().strftime('%Y/%m/%d')
            return os.path.join(self.base_path, date_path, unique_filename)
        
        return os.path.join(self.base_path, unique_filename)


def get_upload_path(base_path, include_date=True):
    """
    Convenience function to create upload path
    
    Args:
        base_path: Base directory for uploads
        include_date: Whether to include date subdirectories
    
    Returns:
        UploadPathFactory instance
    """
    return UploadPathFactory(base_path, include_date)


@deconstructible
class UUIDUploadPath:
    """
    UUID-based upload path generator
    
    Generates paths like:
        media/students/photos/uuid.jpg
    """
    
    def __init__(self, base_path):
        self.base_path = base_path
    
    def __call__(self, instance, filename):
        ext = os.path.splitext(filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{ext}"
        return os.path.join(self.base_path, unique_filename)


@deconstructible
class ModelBasedUploadPath:
    """
    Model-based upload path generator
    
    Includes model name in path:
        media/StudentModel/photos/uuid.jpg
    """
    
    def __init__(self, folder_name):
        self.folder_name = folder_name
    
    def __call__(self, instance, filename):
        ext = os.path.splitext(filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{ext}"
        
        # Get model name
        model_name = instance.__class__.__name__.lower()
        
        return os.path.join(model_name, self.folder_name, unique_filename)


def clean_filename(filename):
    """
    Clean filename by removing unsafe characters
    
    Args:
        filename: Original filename
    
    Returns:
        str: Cleaned filename
    """
    # Get name and extension
    name, ext = os.path.splitext(filename)
    
    # Remove unsafe characters
    safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
    name = ''.join(c for c in name if c in safe_chars)
    
    # Ensure name is not empty
    if not name:
        name = "file"
    
    # Limit length
    name = name[:100]
    
    return f"{name}{ext}"


def get_file_extension(filename):
    """
    Get file extension without the dot
    
    Args:
        filename: Filename
    
    Returns:
        str: Extension in lowercase
    """
    return os.path.splitext(filename)[1].lower().lstrip('.')


def get_file_size_display(size_bytes):
    """
    Convert file size to human-readable format
    
    Args:
        size_bytes: Size in bytes
    
    Returns:
        str: Human-readable size (e.g., "2.5 MB")
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} PB"
