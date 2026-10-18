from django.contrib import admin
from .models import Issue, StatusHistory, Comment, Upvote

class StatusHistoryInline(admin.TabularInline):
    model = StatusHistory
    extra = 0
    readonly_fields = ('status', 'changed_by', 'notes', 'created_at')

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('author', 'content', 'created_at')

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'status', 'priority', 'priority_score', 'student', 'assigned_to', 'created_at')
    list_filter = ('category', 'status', 'priority', 'department', 'building')
    search_fields = ('title', 'description', 'student__email', 'student__username', 'location_detail')
    inlines = [StatusHistoryInline, CommentInline]

@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('issue', 'status', 'changed_by', 'created_at')
    list_filter = ('status',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('issue', 'author', 'created_at')

@admin.register(Upvote)
class UpvoteAdmin(admin.ModelAdmin):
    list_display = ('issue', 'user', 'created_at')
