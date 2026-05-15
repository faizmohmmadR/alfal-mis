#!/bin/bash

# ERP System Setup Script
# This script initializes the database, creates default data, and sets up the system

echo "=========================================="
echo "  ERP System Setup Script"
echo "=========================================="
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Activate virtual environment if exists
if [ -f "venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create default permissions
echo "Creating default permissions..."
python manage.py setup_permissions

# Initialize chart of accounts
echo "Initializing chart of accounts..."
python manage.py init_chart_of_accounts

# Create superuser if not exists
echo ""
echo "Creating superuser account..."
python manage.py shell -c "
from account.models import User
if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )
    print('Superuser created: admin@example.com / admin123')
else:
    print('Superuser already exists')
"

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Run the server with: python manage.py runserver"
echo ""