"""
Standardized API Response Utilities
Provides consistent response formats across all API endpoints
"""
from rest_framework.response import Response
from rest_framework import status
from typing import Any, Dict, List, Optional, Union


class APIResponse:
    """
    Standardized API response format
    
    Success Response:
    {
        "success": true,
        "message": "Operation successful",
        "data": {...},
        "errors": null
    }
    
    Error Response:
    {
        "success": false,
        "message": "Operation failed",
        "data": null,
        "errors": {...}
    }
    """
    
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operation successful",
        status_code: int = status.HTTP_200_OK
    ) -> Response:
        """
        Return a successful response
        
        Args:
            data: The data to return
            message: Success message
            status_code: HTTP status code (default 200)
        
        Returns:
            Response object with success format
        """
        return Response(
            {
                "success": True,
                "message": message,
                "data": data,
                "errors": None
            },
            status=status_code
        )
    
    @staticmethod
    def error(
        message: str = "Operation failed",
        errors: Optional[Union[Dict, List, str]] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST
    ) -> Response:
        """
        Return an error response
        
        Args:
            message: Error message
            errors: Detailed error information
            status_code: HTTP status code (default 400)
        
        Returns:
            Response object with error format
        """
        return Response(
            {
                "success": False,
                "message": message,
                "data": None,
                "errors": errors
            },
            status=status_code
        )
    
    @staticmethod
    def created(
        data: Any = None,
        message: str = "Resource created successfully"
    ) -> Response:
        """Return a 201 Created response"""
        return APIResponse.success(
            data=data,
            message=message,
            status_code=status.HTTP_201_CREATED
        )
    
    @staticmethod
    def updated(
        data: Any = None,
        message: str = "Resource updated successfully"
    ) -> Response:
        """Return a 200 OK response for updates"""
        return APIResponse.success(
            data=data,
            message=message,
            status_code=status.HTTP_200_OK
        )
    
    @staticmethod
    def deleted(
        message: str = "Resource deleted successfully"
    ) -> Response:
        """Return a 204 No Content response"""
        return Response(
            {
                "success": True,
                "message": message,
                "data": None,
                "errors": None
            },
            status=status.HTTP_204_NO_CONTENT
        )
    
    @staticmethod
    def not_found(
        message: str = "Resource not found",
        errors: Optional[Union[Dict, List, str]] = None
    ) -> Response:
        """Return a 404 Not Found response"""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @staticmethod
    def unauthorized(
        message: str = "Authentication required",
        errors: Optional[Union[Dict, List, str]] = None
    ) -> Response:
        """Return a 401 Unauthorized response"""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    @staticmethod
    def forbidden(
        message: str = "You do not have permission to perform this action",
        errors: Optional[Union[Dict, List, str]] = None
    ) -> Response:
        """Return a 403 Forbidden response"""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    @staticmethod
    def validation_error(
        errors: Optional[Union[Dict, List, str]] = None,
        message: str = "Validation error"
    ) -> Response:
        """Return a 422 Unprocessable Entity response"""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    
    @staticmethod
    def server_error(
        message: str = "Internal server error",
        errors: Optional[Union[Dict, List, str]] = None
    ) -> Response:
        """Return a 500 Internal Server Error response"""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    @staticmethod
    def paginated(
        data: List,
        page: int,
        page_size: int,
        total_count: int,
        message: str = "Data retrieved successfully"
    ) -> Response:
        """
        Return a paginated response
        
        Args:
            data: List of items for current page
            page: Current page number
            page_size: Items per page
            total_count: Total number of items
            message: Success message
        
        Returns:
            Response with paginated data and metadata
        """
        total_pages = (total_count + page_size - 1) // page_size
        
        return Response(
            {
                "success": True,
                "message": message,
                "data": data,
                "errors": None,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_previous": page > 1
                }
            },
            status=status.HTTP_200_OK
        )


class ResponseMiddleware:
    """
    Middleware to standardize all API responses
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Only process API responses
        if not request.path.startswith('/api/'):
            return response
        
        # Skip if already standardized
        if hasattr(response, 'data') and isinstance(response.data, dict):
            if 'success' in response.data:
                return response
        
        # Standardize the response
        if hasattr(response, 'data'):
            if 200 <= response.status_code < 300:
                response.data = {
                    "success": True,
                    "message": "Operation successful",
                    "data": response.data,
                    "errors": None
                }
            else:
                response.data = {
                    "success": False,
                    "message": "Operation failed",
                    "data": None,
                    "errors": response.data
                }
        
        return response
