from django.shortcuts import render

from rest_framework import viewsets
from django.contrib.auth.models import Permission
from rest_framework.permissions import DjangoModelPermissions
from .serializers import PermissionSerializer

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [DjangoModelPermissions]
