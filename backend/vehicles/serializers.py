from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ('id', 'make', 'model', 'category', 'price', 'quantity', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')