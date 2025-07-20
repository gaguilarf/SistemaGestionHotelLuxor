from rest_framework import serializers
from users.models import User
from django.contrib.auth.models import Group, Permission

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name',
        required=False
    )
    group = serializers.CharField(write_only=True, required=False)  # NUEVO: campo simple
    user_permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False
    )
    group_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'
   
    def get_group_permissions(self, obj):
        perms = Permission.objects.filter(group__user=obj).values_list('codename', flat=True).distinct()
        return list(perms)

    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        group_name = validated_data.pop('group', None)  # NUEVO: extraer group
        permissions = validated_data.pop('user_permissions', [])
        password = validated_data.pop('password', None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        # NUEVO: manejar grupo único
        if group_name:
            try:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
            except Group.DoesNotExist:
                pass
        elif groups:
            user.groups.set(groups)

        user.user_permissions.set(permissions)
        return user

    def update(self, instance, validated_data):
        groups = validated_data.pop('groups', None)
        group_name = validated_data.pop('group', None)  # NUEVO: extraer group
        permissions = validated_data.pop('user_permissions', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        # NUEVO: manejar grupo único
        if group_name:
            try:
                group = Group.objects.get(name=group_name)
                instance.groups.clear()
                instance.groups.add(group)
            except Group.DoesNotExist:
                pass
        elif groups is not None:
            instance.groups.set(groups)

        if permissions is not None:
            instance.user_permissions.set(permissions)

        return instance