from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum
from api.models.data.projects import Project, ProjectPayment
from api.serializers.data.projects import (
    ProjectSerializer, ProjectDetailSerializer, ProjectPaymentSerializer
)
from api.views.data.base import DataRootViewSet

class ProjectViewSet(DataRootViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    search_fields = ['title', 'description', 'customer__name']
    filterset_fields = ['status', 'customer', 'currency']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('customer')
        return queryset
    
    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """Get all payments for a specific project"""
        project = self.get_object()
        payments = ProjectPayment.objects.filter(project=project)
        serializer = ProjectPaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get project statistics"""
        queryset = self.filter_queryset(self.get_queryset())
        
        stats = {
            'total_projects': queryset.count(),
            'pending_projects': queryset.filter(status='pending').count(),
            'in_progress_projects': queryset.filter(status='in_progress').count(),
            'completed_projects': queryset.filter(status='completed').count(),
            'total_budget': queryset.aggregate(Sum('budget'))['budget__sum'] or 0,
            'total_paid': queryset.aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0,
        }
        
        return Response(stats)

class ProjectPaymentViewSet(DataRootViewSet):
    queryset = ProjectPayment.objects.all().order_by('-payment_date')
    serializer_class = ProjectPaymentSerializer
    search_fields = ['project__title', 'reference_number', 'notes']
    filterset_fields = ['project', 'payment_method', 'payment_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('project', 'project__customer')
        return queryset