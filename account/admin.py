from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = (
        "id",
        "username",
        "email",
        "phone",
        "is_admin",
        "is_active",
    )
    list_filter = ("is_admin", "is_active", "is_superuser")
    search_fields = ("username", "email", "phone", "first_name", "last_name")
    ordering = ("id",)
    filter_horizontal = ()

    fieldsets = (
        (
            _("Personal Info"),
            {
                "fields": (
                    "username",
                    "email",
                    "phone",
                    "first_name",
                    "last_name",
                    "company",
                    "profile_picture",
                    "role",
                )
            },
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_admin",
                    "is_superuser",
                    "is_staff",
                )
            },
        ),
        (_("Important Dates"), {"fields": ("last_login", "created_at", "updated_at")}),
    )

    readonly_fields = ("created_at", "updated_at", "last_login")

    add_fieldsets = (
        (
            _("Create New User"),
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "phone",
                    "first_name",
                    "company",
                    "last_name",
                    "is_buyer",
                    "is_seller",
                    "is_admin",
                    "password1",
                    "password2",
                ),
            },
        ),
    )

    def get_queryset(self, request):
        """Ensure only superusers can see all users."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(is_admin=False)


# Register the model
admin.site.register(User, UserAdmin)
