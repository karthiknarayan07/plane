# Third party imports
from rest_framework.permissions import BasePermission

# Module imports
from plane.license.models import Instance, InstanceAdmin


class InstanceOwnerPermission(BasePermission):
    def has_permission(self, request, view):
        instance = Instance.objects.first()
        return InstanceAdmin.objects.filter(
            role=20,
            instance=instance,
        ).exists()


class InstanceAdminPermission(BasePermission):
    def has_permission(self, request, view):
        instance = Instance.objects.first()
        return InstanceAdmin.objects.filter(
            role__gte=15,
            instance=instance,
        ).exists()
