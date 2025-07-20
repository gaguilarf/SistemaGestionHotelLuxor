from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin

admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)
