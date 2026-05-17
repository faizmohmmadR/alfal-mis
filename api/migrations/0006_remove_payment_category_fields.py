# Generated migration — no autodetection; fields removed manually:
#   - StudentCategory model (was created in 0002)
#   - Student.category FK             (was added in 0002)
#   - PaymentCategory model            (was created in 0003)
#   - StudentPayment.category FK      (was added in 0003)
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0005_rename_api_student_class_e6be54_idx_api_student_class_l_fea202_idx_and_more'),
    ]

    operations = [
        # ── Remove StudentPayment.category FK ──
        migrations.RemoveField(
            model_name='studentpayment',
            name='category',
        ),
        # ── Delete PaymentCategory model ──
        migrations.DeleteModel(
            name='PaymentCategory',
        ),
        # ── Remove Student.category FK ──
        migrations.RemoveField(
            model_name='student',
            name='category',
        ),
        # ── Delete StudentCategory model ──
        migrations.DeleteModel(
            name='StudentCategory',
        ),
    ]
