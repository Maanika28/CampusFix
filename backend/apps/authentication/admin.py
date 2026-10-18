from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'department', 'identifier', 'is_staff', 'is_active')
    list_filter = ('role', 'department', 'is_staff', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('CampusFix Details', {
            'fields': ('role', 'phone', 'identifier', 'department', 'avatar', 'is_verified')
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('CampusFix Details', {
            'fields': ('role', 'email', 'first_name', 'last_name', 'phone', 'identifier', 'department')
        }),
    )
    search_fields = ('email', 'first_name', 'last_name', 'identifier')
    ordering = ('email',)
