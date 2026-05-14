from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse, FileResponse
import subprocess
import os
import json
from django.conf import settings
from django.utils import timezone
from datetime import datetime

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def backup_database(request):
    if not request.user.is_admin and not request.user.is_superuser:
        return JsonResponse({"error": "Permission denied"}, status=403)
    
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    db_engine = settings.DATABASES['default']['ENGINE']
    
    try:
        if 'sqlite' in db_engine:
            db_path = settings.DATABASES['default']['NAME']
            backup_file = os.path.join(backup_dir, f"backup_{timestamp}.db")
            import shutil
            shutil.copy2(db_path, backup_file)
            file_size = os.path.getsize(backup_file)
        else:
            db_name = settings.DATABASES['default']['NAME']
            db_user = settings.DATABASES['default']['USER']
            db_password = settings.DATABASES['default']['PASSWORD']
            db_host = settings.DATABASES['default']['HOST']
            db_port = settings.DATABASES['default']['PORT']
            backup_file = os.path.join(backup_dir, f"backup_{timestamp}.sql")
            
            dump_command = ['mysqldump', '-u', db_user, f'-p{db_password}', '-h', db_host, '--port', str(db_port), db_name]
            with open(backup_file, 'w') as f:
                subprocess.run(dump_command, stdout=f, stderr=subprocess.PIPE, check=True)
            file_size = os.path.getsize(backup_file)
        
        return JsonResponse({
            "message": "Backup created successfully",
            "filename": os.path.basename(backup_file),
            "size": file_size,
            "created_at": timestamp
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_database(request):
    if not request.user.is_admin and not request.user.is_superuser:
        return JsonResponse({"error": "Permission denied"}, status=403)
    
    backup_file = request.data.get('backup_file')
    if not backup_file:
        return JsonResponse({"error": "No backup file provided"}, status=400)
    
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    backup_file_path = os.path.join(backup_dir, backup_file)
    
    if not os.path.exists(backup_file_path):
        return JsonResponse({"error": "Backup file does not exist"}, status=400)
    
    db_engine = settings.DATABASES['default']['ENGINE']
    
    try:
        if 'sqlite' in db_engine:
            db_path = settings.DATABASES['default']['NAME']
            import shutil
            shutil.copy2(backup_file_path, db_path)
        else:
            db_name = settings.DATABASES['default']['NAME']
            db_user = settings.DATABASES['default']['USER']
            db_password = settings.DATABASES['default']['PASSWORD']
            db_host = settings.DATABASES['default']['HOST']
            db_port = settings.DATABASES['default']['PORT']
            
            restore_command = ['mysql', '-u', db_user, f'-p{db_password}', '-h', db_host, '--port', str(db_port), db_name]
            with open(backup_file_path, 'rb') as f:
                subprocess.run(restore_command, stdin=f, stderr=subprocess.PIPE, check=True)
        
        return JsonResponse({"message": "Database restored successfully"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_backups(request):
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    
    if not os.path.exists(backup_dir):
        return JsonResponse({"backups": []})
    
    backup_files = [f for f in os.listdir(backup_dir) if f.endswith(('.sql', '.db'))]
    backups = []
    
    for filename in backup_files:
        file_path = os.path.join(backup_dir, filename)
        stat = os.stat(file_path)
        backups.append({
            "filename": filename,
            "size": stat.st_size,
            "created_at": datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
        })
    
    backups.sort(key=lambda x: x['created_at'], reverse=True)
    return JsonResponse({"backups": backups})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_backup(request):
    if not request.user.is_admin and not request.user.is_superuser:
        return JsonResponse({"error": "Permission denied"}, status=403)
    
    backup_file = request.data.get('backup_file')
    if not backup_file:
        return JsonResponse({"error": "No backup file provided"}, status=400)
    
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    backup_file_path = os.path.join(backup_dir, backup_file)
    
    if not os.path.exists(backup_file_path):
        return JsonResponse({"error": "Backup file does not exist"}, status=400)
    
    try:
        os.remove(backup_file_path)
        return JsonResponse({"message": "Backup deleted successfully"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_backup(request, filename):
    if not request.user.is_admin and not request.user.is_superuser:
        return JsonResponse({"error": "Permission denied"}, status=403)
    
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    backup_file_path = os.path.join(backup_dir, filename)
    
    if not os.path.exists(backup_file_path):
        return JsonResponse({"error": "Backup file does not exist"}, status=404)
    
    try:
        response = FileResponse(open(backup_file_path, 'rb'), as_attachment=True, filename=filename)
        return response
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
