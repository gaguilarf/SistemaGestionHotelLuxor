from django.shortcuts import render

from rest_framework import viewsets
from django.contrib.auth.models import Group
from rest_framework.permissions import DjangoModelPermissions
from .serializers import GroupSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [DjangoModelPermissions]
