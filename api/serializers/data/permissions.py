from rest_framework import serializers
from api.models.data.permissions import Permission, UserPermission
from api.serializers.base import DataRootSerializer


class PermissionSerializer(DataRootSerializer):
    class Meta:
        model = Permission
        fields = '__all__'


class UserPermissionSerializer(DataRootSerializer):
    permission_name = serializers.CharField(source='permission.name', read_only=True)
    permission_codename = serializers.CharField(source='permission.codename', read_only=True)
    permission_module = serializers.CharField(source='permission.module', read_only=True)
    
    class Meta:
        model = UserPermission
        fields = ['id', 'user', 'permission', 'permission_name', 'permission_codename', 'permission_module', 'granted', 'created_at', 'updated_at']


class UserPermissionUpdateSerializer(serializers.Serializer):
    permissions = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_permissions(self, value):
        for perm in value:
            if 'permission_id' not in perm or 'granted' not in perm:
                raise serializers.ValidationError("Each permission must have 'permission_id' and 'granted' fields")
        return value