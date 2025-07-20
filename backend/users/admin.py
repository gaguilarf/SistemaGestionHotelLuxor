from django.contrib import admin
from .models import User, UserAccessLog
from django.contrib.auth.models import Permission

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'get_groups', 'is_active', 'last_login')
    search_fields = ('email', 'username', 'dni')
    list_filter = ('groups', 'is_active')
    filter_horizontal = ('groups', 'user_permissions')
    readonly_fields = ('get_group_permissions',) 

    def get_groups(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])
    get_groups.short_description = 'Groups'  # Título de columna

    def get_group_permissions(self, obj):
        perms = Permission.objects.filter(group__user=obj).values_list('codename', flat=True).distinct()
        return ", ".join(perms)
    get_group_permissions.short_description = 'Group Permissions'

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'dni', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'get_group_permissions', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

@admin.register(UserAccessLog)
class AccessLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp', 'ip_address')
