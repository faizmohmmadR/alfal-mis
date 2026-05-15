"""
File validation utilities for secure file uploads
"""
import os
from django.core.exceptions import ValidationError
from django.conf import settings
from PIL import Image
import logging

logger = logging.getLogger(__name__)


class FileValidator:
    """
    Comprehensive file validation utility
    
    Validates:
    - File size
    - File type (MIME type via extension)
    - File extension
    - Image dimensions (for images)
    - Malicious content
    """
    
    # Allowed extensions by category
    ALLOWED_EXTENSIONS = {
        'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
        'document': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'],
        'archive': ['.zip', '.rar', '.7z', '.gz'],
    }
    
    # MIME type mapping based on extension
    MIME_TYPE_MAP = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.7z': 'application/x-7z-compressed',
        '.gz': 'application/gzip',
    }
    
    # Maximum file sizes in bytes
    MAX_FILE_SIZES = {
        'image': 5 * 1024 * 1024,      # 5 MB
        'document': 10 * 1024 * 1024,  # 10 MB
        'archive': 20 * 1024 * 1024,   # 20 MB
        'default': getattr(settings, 'MAX_UPLOAD_SIZE', 5 * 1024 * 1024)
    }
    
    # Maximum image dimensions
    MAX_IMAGE_DIMENSIONS = (4096, 4096)  # width, height in pixels
    
    def __init__(
        self,
        allowed_categories=None,
        max_size=None,
        allowed_extensions=None
    ):
        """
        Initialize file validator
        
        Args:
            allowed_categories: List of categories to allow ('image', 'document', 'archive')
            max_size: Maximum file size in bytes
            allowed_extensions: List of allowed file extensions
        """
        self.allowed_categories = allowed_categories or ['image', 'document']
        self.max_size = max_size
        self.allowed_extensions = allowed_extensions
    
    def __call__(self, file):
        """
        Validate the uploaded file
        
        Args:
            file: Uploaded file object
        
        Raises:
            ValidationError: If validation fails
        """
        errors = []
        
        # Validate file size
        size_error = self._validate_size(file)
        if size_error:
            errors.append(size_error)
        
        # Validate file extension
        ext_error = self._validate_extension(file)
        if ext_error:
            errors.append(ext_error)
        
        # Validate image dimensions if it's an image
        if self._is_image(file):
            dim_error = self._validate_image_dimensions(file)
            if dim_error:
                errors.append(dim_error)
        
        # Check for malicious content
        security_error = self._check_malicious_content(file)
        if security_error:
            errors.append(security_error)
        
        if errors:
            raise ValidationError(errors)
    
    def _validate_size(self, file):
        """Validate file size"""
        max_size = self.max_size or self.MAX_FILE_SIZES['default']
        
        if file.size > max_size:
            max_size_mb = max_size / (1024 * 1024)
            return f"File size ({file.size / (1024 * 1024):.2f} MB) exceeds maximum allowed size ({max_size_mb:.2f} MB)"
        return None
    
    def _validate_extension(self, file):
        """Validate file extension"""
        ext = os.path.splitext(file.name)[1].lower()
        
        allowed_extensions = self.allowed_extensions
        if not allowed_extensions:
            allowed_extensions = []
            for category in self.allowed_categories:
                allowed_extensions.extend(self.ALLOWED_EXTENSIONS.get(category, []))
        
        if ext not in allowed_extensions:
            return f"File extension '{ext}' is not allowed. Allowed extensions: {', '.join(allowed_extensions)}"
        return None
    
    def _is_image(self, file):
        """Check if file is an image"""
        ext = os.path.splitext(file.name)[1].lower()
        return ext in self.ALLOWED_EXTENSIONS['image']
    
    def _validate_image_dimensions(self, file):
        """Validate image dimensions"""
        try:
            file.seek(0)
            img = Image.open(file)
            width, height = img.size
            file.seek(0)
            
            max_width, max_height = self.MAX_IMAGE_DIMENSIONS
            if width > max_width or height > max_height:
                return f"Image dimensions ({width}x{height}) exceed maximum allowed dimensions ({max_width}x{max_height})"
            
            return None
        except Exception as e:
            logger.error(f"Error validating image dimensions: {e}")
            return None
    
    def _check_malicious_content(self, file):
        """Check for potentially malicious content"""
        try:
            file.seek(0)
            content = file.read(1024)
            file.seek(0)
            
            # Check for PHP tags
            if b'<?php' in content or b'<?=' in content:
                return "File contains potentially malicious content"
            
            # Check for script tags
            if b'<script' in content.lower():
                return "File contains potentially malicious content"
            
            # Check for executable signatures
            executable_signatures = [
                b'MZ',           # Windows executable
                b'\x7fELF',      # Linux executable
                b'\xca\xfe\xba\xbe',  # Java class
            ]
            
            for sig in executable_signatures:
                if content.startswith(sig):
                    return "File appears to be an executable"
            
            return None
        except Exception as e:
            logger.error(f"Error checking malicious content: {e}")
            return None


def validate_file_size(file, max_size_mb=5):
    """
    Simple file size validator
    
    Args:
        file: Uploaded file
        max_size_mb: Maximum size in MB
    
    Raises:
        ValidationError: If file size exceeds limit
    """
    max_size = max_size_mb * 1024 * 1024
    if file.size > max_size:
        raise ValidationError(
            f"File size ({file.size / (1024 * 1024):.2f} MB) exceeds maximum allowed size ({max_size_mb} MB)"
        )


def validate_image_file(file):
    """
    Validate image file specifically
    
    Args:
        file: Uploaded image file
    
    Raises:
        ValidationError: If validation fails
    """
    validator = FileValidator(allowed_categories=['image'])
    validator(file)


def validate_document_file(file):
    """
    Validate document file
    
    Args:
        file: Uploaded document file
    
    Raises:
        ValidationError: If validation fails
    """
    validator = FileValidator(allowed_categories=['document'])
    validator(file)


def get_file_category(file):
    """
    Determine the category of an uploaded file
    
    Args:
        file: Uploaded file
    
    Returns:
        str: Category ('image', 'document', 'archive', or 'unknown')
    """
    ext = os.path.splitext(file.name)[1].lower()
    
    for category, extensions in FileValidator.ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category
    
    return 'unknown'


def get_mime_type(filename):
    """
    Get MIME type based on file extension
    
    Args:
        filename: The filename
    
    Returns:
        str: MIME type or 'application/octet-stream' if unknown
    """
    ext = os.path.splitext(filename)[1].lower()
    return FileValidator.MIME_TYPE_MAP.get(ext, 'application/octet-stream')