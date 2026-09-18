# Task Management

A Django REST API with a React task board.

## Requirements

- Python
- Node.js and npm

## First-Time Setup

From the project folder, open a terminal and run:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install django djangorestframework django-cors-headers reportlab openpyxl pillow
python manage.py migrate
python manage.py createsuperuser
```

If `.venv` already exists, skip the first line and install command if the packages are already installed.

Enter a username and password when Django asks. This account is the admin account.

Start Django:

```powershell
python manage.py runserver 0.0.0.0:8000
```

Backend URL: `http://127.0.0.1:8000`

## Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
npm start
```

Frontend URL: `http://127.0.0.1:3000`

## Start Using The App

1. Open `http://127.0.0.1:3000`.
2. Log in with the superuser account to use admin features.
3. Use **Create Task** to add tasks.
4. Sign up with another account to create a normal user.
5. Normal users can view tasks, change task status, and add comments.

## Main Operations

- Admins can create, edit, delete, and reorder tasks.
- Users can sign up, log in, update task status, and add comments.
- Tasks can include an uploaded image.
- The dashboard can export the full task list as PDF or Excel.
- Search, status filters, priority filters, and pagination are available.

## Tests

From the project folder:

```powershell
.\.venv\Scripts\python.exe manage.py test tasks.tests
```

To build the frontend:

```powershell
cd frontend
npm run build
```
