from django.views.generic import View
from django.http import HttpResponse, Http404
from django.conf import settings
import os
import mimetypes

class FrontendView(View):
    def get(self, request, path=''):
        frontend_dir = os.path.join(settings.BASE_DIR, 'static', 'frontend')
        
        if path and not path.startswith('api/'):
            file_path = os.path.join(frontend_dir, path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                content_type, _ = mimetypes.guess_type(file_path)
                with open(file_path, 'rb') as f:
                    return HttpResponse(f.read(), content_type=content_type)
        
        index_path = os.path.join(frontend_dir, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                return HttpResponse(f.read(), content_type='text/html')
        
        raise Http404()
