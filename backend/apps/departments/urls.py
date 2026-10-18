from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, BuildingViewSet, ClassroomViewSet, QRCodeLookupView

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'buildings', BuildingViewSet, basename='building')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')

urlpatterns = [
    path('', include(router.urls)),
    path('qr/lookup/<str:token>/', QRCodeLookupView.as_view(), name='qr-lookup'),
]
