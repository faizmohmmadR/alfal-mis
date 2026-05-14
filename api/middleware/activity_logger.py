import json
import logging
from django.utils.deprecation import MiddlewareMixin
from api.models.data.activity_log import ActivityLog

logger = logging.getLogger(__name__)


class ActivityLoggerMiddleware(MiddlewareMixin):
    """Middleware to automatically log user activities"""
    
    EXCLUDED_PATHS = [
        '/api/activity-logs/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    EXCLUDED_METHODS = ['GET', 'OPTIONS', 'HEAD']
    
    def process_response(self, request, response):
        # Skip if not authenticated
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response
        
        # Skip excluded paths
        if any(request.path.startswith(path) for path in self.EXCLUDED_PATHS):
            return response
        
        # Skip excluded methods
        if request.method in self.EXCLUDED_METHODS:
            return response
        
        # Only log successful operations
        if response.status_code not in [200, 201, 204]:
            return response
        
        try:
            self._log_activity(request, response)
        except Exception as e:
            logger.error(f"Activity logging error: {e}", exc_info=True)
        
        return response
    
    def _log_activity(self, request, response):
        """Create activity log entry"""
        action = self._get_action(request.method)
        model_name, object_id = self._parse_path(request.path)
        
        if not model_name:
            return
        
        description = self._generate_description(request.user, action, model_name, object_id)
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        changes = None
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if request.body:
                    changes = json.loads(request.body)
            except:
                pass
        
        ActivityLog.objects.create(
            user=request.user,
            action=action,
            model_name=model_name,
            object_id=object_id,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            changes=changes
        )
    
    def _get_action(self, method):
        """Map HTTP method to action"""
        mapping = {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        }
        return mapping.get(method, 'view')
    
    def _parse_path(self, path):
        """Extract model name and object ID from path"""
        parts = [p for p in path.split('/') if p]
        
        if len(parts) < 2 or parts[0] != 'api':
            return None, None
        
        model_name = parts[1].replace('-', '_')
        object_id = None
        
        if len(parts) > 2 and parts[2].isdigit():
            object_id = int(parts[2])
        
        return model_name, object_id
    
    def _generate_description(self, user, action, model_name, object_id):
        """Generate human-readable description"""
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        role = getattr(user, 'role', 'User')
        
        model_display = model_name.replace('_', ' ').title()
        
        if object_id:
            return f"{user_name} ({role}) {action}d {model_display} #{object_id}"
        else:
            return f"{user_name} ({role}) {action}d {model_display}"
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
