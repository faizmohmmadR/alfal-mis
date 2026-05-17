# Generated migration for ClassLevel, Student, and StudentPayment changes

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_paymentcategory_remove_studentpayment_payment_method_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClassLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level', models.CharField(choices=[('1', 'Class 1'), ('2', 'Class 2'), ('3', 'Class 3'), ('4', 'Class 4'), ('5', 'Class 5'), ('6', 'Class 6'), ('7', 'Class 7'), ('8', 'Class 8'), ('9', 'Class 9'), ('10', 'Class 10'), ('11', 'Class 11'), ('12', 'Class 12')], max_length=2, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['level'],
            },
        ),
        migrations.AddField(
            model_name='student',
            name='class_level',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='students', to='api.classlevel'),
        ),
        migrations.AddField(
            model_name='student',
            name='currency',
            field=models.CharField(choices=[('USD', 'US Dollar ($)'), ('AFN', 'Afghan Afghani (؋)')], default='USD', max_length=3),
        ),
        migrations.AddField(
            model_name='student',
            name='monthly_fee',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='student',
            name='payment_cycle',
            field=models.CharField(choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')], default='monthly', max_length=10),
        ),
        migrations.AddField(
            model_name='student',
            name='yearly_fee',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='studentpayment',
            name='payment_cycle',
            field=models.CharField(choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')], default='monthly', help_text='Whether this payment is monthly or yearly', max_length=10),
        ),
        migrations.AddField(
            model_name='studentpayment',
            name='period_month',
            field=models.CharField(blank=True, help_text='Month number (1-12) this payment covers', max_length=2, null=True),
        ),
        migrations.AddField(
            model_name='studentpayment',
            name='period_year',
            field=models.CharField(blank=True, help_text='Year this payment covers, e.g. 2026', max_length=4, null=True),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['class_level'], name='api_student_class_e6be54_idx'),
        ),
        migrations.AddIndex(
            model_name='student',
            index=models.Index(fields=['payment_cycle'], name='api_student_payment__14e16a_idx'),
        ),
        migrations.AddIndex(
            model_name='studentpayment',
            index=models.Index(fields=['payment_cycle'], name='api_stud_payment__83478a_idx'),
        ),
        migrations.AddIndex(
            model_name='studentpayment',
            index=models.Index(fields=['period_year', 'period_month'], name='api_stud_period__109a5b_idx'),
        ),
    ]
