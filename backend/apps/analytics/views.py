from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg, F, ExpressionWrapper, fields
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.issues.models import Issue, StatusHistory
from apps.departments.models import Building, Department
from apps.authentication.models import User

class AnalyticsDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Allow admin or staff to view analytics
        total_issues = Issue.objects.count()
        pending_count = Issue.objects.filter(status='Pending').count()
        assigned_count = Issue.objects.filter(status='Assigned').count()
        in_progress_count = Issue.objects.filter(status='In Progress').count()
        resolved_count = Issue.objects.filter(status='Resolved').count()
        closed_count = Issue.objects.filter(status='Closed').count()

        resolution_rate = round(((resolved_count + closed_count) / total_issues * 100), 1) if total_issues > 0 else 0

        # Calculate average resolution time (hours) for resolved issues
        resolved_issues = Issue.objects.filter(resolved_at__isnull=False)
        total_hours = 0
        valid_count = 0
        for issue in resolved_issues:
            if issue.resolved_at and issue.created_at:
                diff = (issue.resolved_at - issue.created_at).total_seconds() / 3600
                if diff >= 0:
                    total_hours += diff
                    valid_count += 1
        avg_resolution_hours = round(total_hours / valid_count, 1) if valid_count > 0 else 0

        # Category Breakdown
        category_counts = (
            Issue.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        categories_data = [
            {
                'category': item['category'],
                'count': item['count'],
                'percentage': round((item['count'] / total_issues * 100), 1) if total_issues > 0 else 0
            }
            for item in category_counts
        ]

        # Status Breakdown
        status_data = [
            {'status': 'Pending', 'count': pending_count, 'color': '#F59E0B'},
            {'status': 'Assigned', 'count': assigned_count, 'color': '#3B82F6'},
            {'status': 'In Progress', 'count': in_progress_count, 'color': '#8B5CF6'},
            {'status': 'Resolved', 'count': resolved_count, 'color': '#10B981'},
            {'status': 'Closed', 'count': closed_count, 'color': '#6B7280'},
        ]

        # Priority Breakdown
        priority_counts = (
            Issue.objects.values('priority')
            .annotate(count=Count('id'))
        )
        priority_dict = {p['priority']: p['count'] for p in priority_counts}
        priority_data = [
            {'priority': 'Urgent', 'count': priority_dict.get('Urgent', 0), 'color': '#EF4444'},
            {'priority': 'High', 'count': priority_dict.get('High', 0), 'color': '#F97316'},
            {'priority': 'Medium', 'count': priority_dict.get('Medium', 0), 'color': '#FBBF24'},
            {'priority': 'Low', 'count': priority_dict.get('Low', 0), 'color': '#10B981'},
        ]

        # Building Heatmap / Issue distribution
        building_counts = (
            Issue.objects.filter(building__isnull=False)
            .values('building__id', 'building__name', 'building__code')
            .annotate(count=Count('id'))
            .order_by('-count')[:8]
        )
        building_data = [
            {
                'id': item['building__id'],
                'name': item['building__name'],
                'code': item['building__code'],
                'count': item['count']
            }
            for item in building_counts
        ]

        # Past 7 Days Trend
        today = timezone.now().date()
        trend_days = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.max.time()))
            
            reported = Issue.objects.filter(created_at__range=(day_start, day_end)).count()
            resolved = Issue.objects.filter(resolved_at__range=(day_start, day_end)).count()

            trend_days.append({
                'date': day.strftime('%a, %b %d'),
                'reported': reported,
                'resolved': resolved
            })

        # Staff Performance Leaderboard
        staff_performance = (
            Issue.objects.filter(assigned_to__isnull=False, status__in=['Resolved', 'Closed'])
            .values('assigned_to__id', 'assigned_to__first_name', 'assigned_to__last_name', 'assigned_to__email')
            .annotate(resolved_count=Count('id'))
            .order_by('-resolved_count')[:5]
        )
        staff_data = [
            {
                'id': s['assigned_to__id'],
                'name': f"{s['assigned_to__first_name']} {s['assigned_to__last_name']}".strip() or s['assigned_to__email'],
                'email': s['assigned_to__email'],
                'resolved_count': s['resolved_count']
            }
            for s in staff_performance
        ]

        # Department distribution
        dept_counts = (
            Issue.objects.filter(department__isnull=False)
            .values('department__id', 'department__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        dept_data = [
            {
                'id': d['department__id'],
                'name': d['department__name'],
                'count': d['count']
            }
            for d in dept_counts
        ]

        return Response({
            'summary': {
                'total_issues': total_issues,
                'pending': pending_count,
                'assigned': assigned_count,
                'in_progress': in_progress_count,
                'resolved': resolved_count,
                'closed': closed_count,
                'resolution_rate': resolution_rate,
                'avg_resolution_hours': avg_resolution_hours,
                'urgent_count': priority_dict.get('Urgent', 0)
            },
            'categories': categories_data,
            'statuses': status_data,
            'priorities': priority_data,
            'buildings': building_data,
            'departments': dept_data,
            'trends': trend_days,
            'top_staff': staff_data,
        })
