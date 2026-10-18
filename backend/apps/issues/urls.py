from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IssueViewSet, DuplicateCheckView, ExportIssuesReportView

router = DefaultRouter()
router.register(r'', IssueViewSet, basename='issue')

urlpatterns = [
    path('check-duplicates/', DuplicateCheckView.as_view(), name='issue-check-duplicates'),
    path('export-report/', ExportIssuesReportView.as_view(), name='issue-export-report'),
    path('', include(router.urls)),
]
