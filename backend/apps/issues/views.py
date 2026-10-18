import csv
from django.http import HttpResponse
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Issue, StatusHistory, Comment, Upvote
from .serializers import (
    IssueListSerializer,
    IssueDetailSerializer,
    IssueCreateSerializer,
    IssueStatusUpdateSerializer,
    CommentSerializer,
    StatusHistorySerializer
)
from apps.notifications.utils import create_notification

class IsOwnerOrStaffOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'staff']:
            return True
        return obj.student == request.user


class IssueViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return IssueCreateSerializer
        elif self.action in ['update', 'partial_update']:
            if self.request.user.role in ['staff', 'admin']:
                return IssueStatusUpdateSerializer
            return IssueCreateSerializer
        elif self.action == 'retrieve':
            return IssueDetailSerializer
        return IssueListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Issue.objects.select_related(
            'student', 'assigned_to', 'department', 'building', 'classroom'
        ).prefetch_related('upvotes', 'comments')

        # Role specific default filtering or query params
        category = self.request.query_params.get('category')
        issue_status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        building = self.request.query_params.get('building')
        department = self.request.query_params.get('department')
        search = self.request.query_params.get('search')
        my_issues = self.request.query_params.get('my_issues')
        assigned_to_me = self.request.query_params.get('assigned_to_me')

        if my_issues == 'true':
            queryset = queryset.filter(student=user)
        elif assigned_to_me == 'true':
            queryset = queryset.filter(assigned_to=user)

        if category:
            queryset = queryset.filter(category=category)
        if issue_status:
            queryset = queryset.filter(status=issue_status)
        if priority:
            queryset = queryset.filter(priority=priority)
        if building:
            queryset = queryset.filter(building_id=building)
        if department:
            queryset = queryset.filter(department_id=department)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location_detail__icontains=search) |
                Q(building__name__icontains=search) |
                Q(classroom__room_number__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'], url_path='status')
    def update_status(self, request, pk=None):
        """Update issue status, assign staff, upload repair proof, add repair notes"""
        issue = self.get_object()

        if request.user.role not in ['admin', 'staff'] and issue.student != request.user:
            return Response({'error': 'Unauthorized to change status'}, status=status.HTTP_403_FORBIDDEN)

        serializer = IssueStatusUpdateSerializer(issue, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_issue = serializer.save()

        return Response(IssueDetailSerializer(updated_issue, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        """Toggle upvote on an issue"""
        issue = self.get_object()
        user = request.user

        upvote = Upvote.objects.filter(issue=issue, user=user).first()
        if upvote:
            upvote.delete()
            upvoted = False
        else:
            Upvote.objects.create(issue=issue, user=user)
            upvoted = True
            if issue.student != user:
                create_notification(
                    recipient=issue.student,
                    title="Someone Upvoted Your Complaint",
                    message=f"{user.get_full_name() or user.username} upvoted your issue: '{issue.title}'",
                    notification_type='upvote',
                    issue=issue,
                    send_email=False
                )

        # Recalculate priority score based on new upvote count
        issue.calculate_priority_score()
        issue.save(update_fields=['priority_score', 'priority'])

        return Response({
            'upvoted': upvoted,
            'upvotes_count': issue.upvotes.count(),
            'priority': issue.priority,
            'priority_score': issue.priority_score
        })

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """Add a comment on an issue"""
        issue = self.get_object()
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        comment = Comment.objects.create(
            issue=issue,
            author=request.user,
            content=content
        )

        # Notify relevant users (reporter or assigned staff)
        recipients = set()
        if issue.student != request.user:
            recipients.add(issue.student)
        if issue.assigned_to and issue.assigned_to != request.user:
            recipients.add(issue.assigned_to)

        for recipient in recipients:
            create_notification(
                recipient=recipient,
                title=f"New Comment on Issue #{issue.id}",
                message=f"{request.user.get_full_name() or request.user.username} commented: '{content[:80]}...'",
                notification_type='comment',
                issue=issue
            )

        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class DuplicateCheckView(APIView):
    """
    Smart feature: Checks for potential duplicate issues before reporting.
    Scans open issues in same classroom/building or matching title keywords.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category', '').strip()
        classroom_id = request.query_params.get('classroom')
        building_id = request.query_params.get('building')
        title = request.query_params.get('title', '').strip()

        # Only look at open complaints
        open_issues = Issue.objects.filter(status__in=['Pending', 'Assigned', 'In Progress'])

        query = Q()
        if classroom_id:
            query |= Q(classroom_id=classroom_id, category=category)
        if building_id and category:
            query |= Q(building_id=building_id, category=category)

        if title and len(title) > 3:
            words = [w for w in title.split() if len(w) > 2]
            title_q = Q()
            for word in words:
                title_q |= Q(title__icontains=word) | Q(description__icontains=word)
            query |= title_q

        if not query:
            return Response({'duplicates': []})

        matches = open_issues.filter(query).distinct()[:5]
        serializer = IssueListSerializer(matches, many=True, context={'request': request})
        return Response({
            'duplicates': serializer.data,
            'count': matches.count(),
            'message': 'Potential existing complaints found. You can upvote an existing one to avoid duplicates!' if matches.exists() else 'No duplicates found.'
        })


class ExportIssuesReportView(APIView):
    """
    Admin export endpoint for complaints reports in CSV or JSON format.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin permissions required.'}, status=status.HTTP_403_FORBIDDEN)

        export_format = request.query_params.get('format', 'csv').lower()
        queryset = Issue.objects.select_related('student', 'assigned_to', 'building', 'classroom', 'department').all()

        # Apply any filters
        status_param = request.query_params.get('status')
        category_param = request.query_params.get('category')
        department_param = request.query_params.get('department')
        if status_param:
            queryset = queryset.filter(status=status_param)
        if category_param:
            queryset = queryset.filter(category=category_param)
        if department_param:
            queryset = queryset.filter(department_id=department_param)

        if export_format == 'json':
            serializer = IssueListSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)

        # Generate CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="campusfix_report_{timezone.now():%Y%m%d_%H%M%S}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Title', 'Category', 'Status', 'Priority', 'Priority Score',
            'Reported By', 'Assigned To', 'Department', 'Building', 'Classroom',
            'Location Detail', 'Upvotes', 'Created At', 'Resolved At'
        ])

        for issue in queryset:
            writer.writerow([
                issue.id,
                issue.title,
                issue.category,
                issue.status,
                issue.priority,
                issue.priority_score,
                issue.student.email if issue.student else '',
                issue.assigned_to.email if issue.assigned_to else 'Unassigned',
                issue.department.name if issue.department else '',
                issue.building.name if issue.building else '',
                issue.classroom.room_number if issue.classroom else '',
                issue.location_detail,
                issue.upvotes.count(),
                issue.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                issue.resolved_at.strftime('%Y-%m-%d %H:%M:%S') if issue.resolved_at else 'N/A'
            ])

        return response
