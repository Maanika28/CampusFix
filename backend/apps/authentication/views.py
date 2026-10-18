from rest_framework import generics, permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserListSerializer
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Account created successfully! Please log in.',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserManagementViewSet(viewsets.ModelViewSet):
    """Admin-only viewset to manage users"""
    queryset = User.objects.select_related('department').all().order_by('-date_joined')
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve'] and self.request.query_params.get('role') == 'staff':
            # Allow staff and admin to see staff directory for assignments
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        department = self.request.query_params.get('department')
        search = self.request.query_params.get('search')

        if role:
            queryset = queryset.filter(role=role)
        if department:
            queryset = queryset.filter(department_id=department)
        if search:
            queryset = queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            ) | queryset.filter(
                identifier__icontains=search
            )
        return queryset


class StaffListView(APIView):
    """Endpoint for quick staff listing used in assignment dropdowns"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        department_id = request.query_params.get('department')
        staff_qs = User.objects.filter(role='staff', is_active=True).select_related('department')
        if department_id:
            staff_qs = staff_qs.filter(department_id=department_id)
        serializer = UserListSerializer(staff_qs, many=True)
        return Response(serializer.data)
