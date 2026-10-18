from rest_framework import serializers
from .models import Issue, StatusHistory, Comment, Upvote
from apps.authentication.serializers import UserListSerializer
from apps.departments.serializers import DepartmentSerializer, BuildingSerializer, ClassroomSerializer

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.ReadOnlyField(source='author.role')

    class Meta:
        model = Comment
        fields = ['id', 'issue', 'author', 'author_name', 'author_role', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username


class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StatusHistory
        fields = ['id', 'issue', 'status', 'changed_by', 'changed_by_name', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return obj.changed_by.get_full_name() or obj.changed_by.username
        return "System"


class IssueListSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    building_name = serializers.ReadOnlyField(source='building.name')
    classroom_number = serializers.ReadOnlyField(source='classroom.room_number')
    department_name = serializers.ReadOnlyField(source='department.name')
    upvotes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'category', 'status', 'priority', 'priority_score',
            'student', 'student_name', 'assigned_to', 'assigned_to_name',
            'department', 'department_name', 'building', 'building_name',
            'classroom', 'classroom_number', 'location_detail',
            'image', 'repair_image', 'upvotes_count', 'comments_count', 'is_upvoted',
            'created_at', 'updated_at', 'resolved_at'
        ]

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None

    def get_upvotes_count(self, obj):
        return obj.upvotes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(user=request.user).exists()
        return False


class IssueDetailSerializer(serializers.ModelSerializer):
    student = UserListSerializer(read_only=True)
    assigned_to = UserListSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    building = BuildingSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    upvotes_count = serializers.SerializerMethodField()
    is_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category', 'status', 'priority', 'priority_score',
            'student', 'assigned_to', 'department', 'building', 'classroom',
            'location_detail', 'image', 'repair_image', 'repair_notes',
            'estimated_completion', 'resolved_at', 'created_at', 'updated_at',
            'status_history', 'comments', 'upvotes_count', 'is_upvoted'
        ]

    def get_upvotes_count(self, obj):
        return obj.upvotes.count()

    def get_is_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(user=request.user).exists()
        return False


class IssueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category', 'department',
            'building', 'classroom', 'location_detail', 'image'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        issue = Issue.objects.create(student=user, **validated_data)
        issue.calculate_priority_score()
        issue.save()

        # Create initial status history
        StatusHistory.objects.create(
            issue=issue,
            status='Pending',
            changed_by=user,
            notes='Issue submitted by student'
        )
        return issue


class IssueStatusUpdateSerializer(serializers.ModelSerializer):
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Issue
        fields = ['status', 'assigned_to', 'repair_image', 'repair_notes', 'estimated_completion', 'notes']

    def update(self, instance, validated_data):
        from django.utils import timezone
        from apps.notifications.utils import create_notification

        notes = validated_data.pop('notes', '')
        new_status = validated_data.get('status', instance.status)
        new_assigned = validated_data.get('assigned_to', instance.assigned_to)
        user = self.context['request'].user

        status_changed = (new_status != instance.status)
        assigned_changed = (new_assigned != instance.assigned_to)

        if new_status == 'Resolved' and instance.status != 'Resolved':
            instance.resolved_at = timezone.now()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.calculate_priority_score()
        instance.save()

        if status_changed or notes or assigned_changed:
            history_note = notes or f"Status changed to {new_status}"
            if assigned_changed and new_assigned:
                history_note += f" | Assigned to {new_assigned.get_full_name() or new_assigned.username}"

            StatusHistory.objects.create(
                issue=instance,
                status=new_status,
                changed_by=user,
                notes=history_note
            )

            # Notify the student
            create_notification(
                recipient=instance.student,
                title=f"Issue #{instance.id} Status Updated",
                message=f"Your complaint '{instance.title}' status was updated to '{new_status}'. {history_note}",
                notification_type='status_change',
                issue=instance
            )

            # If newly assigned to staff, notify the staff
            if assigned_changed and new_assigned:
                create_notification(
                    recipient=new_assigned,
                    title=f"New Issue Assigned: #{instance.id}",
                    message=f"You have been assigned to issue '{instance.title}' located at {instance.building.name if instance.building else 'Campus'}.",
                    notification_type='assignment',
                    issue=instance
                )

        return instance
