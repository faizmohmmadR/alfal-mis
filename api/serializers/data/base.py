from rest_framework import serializers

class DataRootSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request', None)
        
        if request and request.method == 'GET':
            # Add any additional fields for GET requests if needed
            pass
            
        return fields