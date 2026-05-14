from django.db import models
from api.models.data.base import BaseModel


class Permission(BaseModel):
    """Permission model for granular access control"""
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    module = models.CharField(max_length=50)  # e.g., 'sales', 'purchases', 'users'
    
    class Meta:
        ordering = ['module', 'name']
    
    def __str__(self):
        return f"{self.module}.{self.codename}"


class UserPermission(BaseModel):
    """User-specific permissions"""
    user = models.ForeignKey('account.User', on_delete=models.CASCADE, related_name='user_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    granted = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'permission']
    
    def __str__(self):
        return f"{self.user.username} - {self.permission.codename}"