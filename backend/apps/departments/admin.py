from django.contrib import admin
from .models import Department, Building, Classroom

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')

@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'total_floors', 'created_at')
    search_fields = ('name', 'code')

@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'building', 'floor', 'qr_code_token')
    list_filter = ('building', 'floor')
    search_fields = ('room_number', 'qr_code_token', 'building__name')
