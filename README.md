# noori-almunium-ERP

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Fonts (For Persian/Pashto Support)
```bash
./install_fonts.sh
```

This installs Vazirmatn font for proper Persian (دری) and Pashto (پښتو) text rendering.
See [FONT_INSTALLATION.md](FONT_INSTALLATION.md) for details.

### 3. Build Frontend
```bash
./build_frontend.sh
```

This will build the React frontend and output it to `static/frontend/`. The Django backend will serve this build.

### 4. Run Backend
```bash
python manage.py runserver
```

The backend will serve both the API (at `/api/`) and the frontend UI (at `/`).

## Language Support

The system supports three languages:
- English (en)
- Persian/Dari (fa) - دری
- Pashto (ps) - پښتو

Persian and Pashto use the Vazirmatn font for optimal readability.
