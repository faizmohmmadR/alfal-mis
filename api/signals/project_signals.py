from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from api.models.data.projects import Project, ProjectPayment
from datetime import date
from django.db.models import Sum


@receiver(post_save, sender=Project)
def create_project_payment(sender, instance, created, **kwargs):
    """Create initial payment record when project is created"""
    if created and instance.paid_amount > 0:
        ProjectPayment.objects.create(
            project=instance,
            amount=instance.paid_amount,
            currency=instance.currency,
            payment_date=instance.start_date or date.today(),
            payment_method='cash',
            notes='Initial payment on project creation'
        )


@receiver(post_delete, sender=ProjectPayment)
def update_project_on_payment_delete(sender, instance, **kwargs):
    """Update project paid_amount when payment is deleted"""
    project = instance.project
    total_paid = ProjectPayment.objects.filter(project=project).aggregate(Sum('amount'))['amount__sum'] or 0
    project.paid_amount = total_paid
    project.save()
