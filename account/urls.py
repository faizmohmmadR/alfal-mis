from django.urls import path, include
from rest_framework import routers
from account.views import (
    LoginView,
    ChangePasswordView,
    PasswordResetView,
    UserProfileView,
    RegisterView,
    VerifyOTPView,
    UserListView,
    UserEditView,
    UserDeleteView,
    UserDetailView,
    UserViewSet
)
from account.backup import backup_database, restore_database, list_backups, delete_backup, download_backup
from knox import views as knox_views


# Router Configuration
router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

# URL Patterns
urlpatterns = [
    path("", include(router.urls)),
    # User Authentication Endpoints
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", knox_views.LogoutView.as_view(), name="logout"),
    path("logoutall/", knox_views.LogoutAllView.as_view(), name="logoutall"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),

    # User Management Endpoints (List, Detail, Edit, Delete)
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/edit/', UserEditView.as_view(), name='user-edit'),
    path('users/<int:pk>/delete/', UserDeleteView.as_view(), name='user-delete'),

    # Backup section
    path("backups/", list_backups, name="list_backups"),
    path("backups/create/", backup_database, name="backup_database"),
    path("backups/restore/", restore_database, name="restore_database"),
    path("backups/delete/", delete_backup, name="delete_backup"),
    path("backups/download/<str:filename>/", download_backup, name="download_backup"),
]