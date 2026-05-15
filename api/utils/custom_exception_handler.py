"""
Custom exception handler for standardized API error responses
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from django.db import DatabaseError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        error_data = {
            'success': False,
            'message': get_error_message(exc),
            'data': None,
            'errors': format_errors(response.data)
        }
        response.data = error_data
        return response
    
    # Handle Django validation errors
    if isinstance(exc, DjangoValidationError):
        error_data = {
            'success': False,
            'message': 'Validation error',
            'data': None,
            'errors': format_errors(exc.messages)
        }
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle 404 errors
    if isinstance(exc, Http404):
        error_data = {
            'success': False,
            'message': 'Resource not found',
            'data': None,
            'errors': str(exc)
        }
        return Response(error_data, status=status.HTTP_404_NOT_FOUND)
    
    # Handle database errors
    if isinstance(exc, DatabaseError):
        logger.error(f"Database error: {exc}", exc_info=True)
        error_data = {
            'success': False,
            'message': 'Database operation failed',
            'data': None,
            'errors': 'A database error occurred. Please try again later.'
        }
        return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Log unhandled exceptions
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    error_data = {
        'success': False,
        'message': 'Internal server error',
        'data': None,
        'errors': 'An unexpected error occurred. Please try again later.'
    }
    return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_error_message(exc):
    """Extract a user-friendly error message"""
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, str):
            return exc.detail
        elif isinstance(exc.detail, dict):
            # Get first error message
            for key, value in exc.detail.items():
                if isinstance(value, list) and value:
                    return f"{key}: {value[0]}"
                elif isinstance(value, str):
                    return f"{key}: {value}"
        elif isinstance(exc.detail, list) and exc.detail:
            return str(exc.detail[0])
    
    return str(exc) or 'An error occurred'


def format_errors(error_data):
    """Format error data for consistent response"""
    if isinstance(error_data, dict):
        formatted = {}
        for key, value in error_data.items():
            if isinstance(value, list):
                formatted[key] = [str(v) for v in value]
            else:
                formatted[key] = str(value)
        return formatted
    elif isinstance(error_data, list):
        return [str(item) for item in error_data]
    else:
        return str(error_data)