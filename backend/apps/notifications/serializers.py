from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    issue_title = serializers.ReadOnlyField(source='issue.title')

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'issue', 'issue_title', 'is_read', 'created_at']
        read_only_fields = ['id', 'title', 'message', 'notification_type', 'issue', 'created_at']
