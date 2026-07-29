from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Vehicle
from .serializers import VehicleSerializer
from .permissions import IsAdminRole


class VehicleListCreateView(generics.ListCreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]


class VehicleSearchView(generics.ListAPIView):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Vehicle.objects.all()
        params = self.request.query_params

        make = params.get('make')
        model = params.get('model')
        category = params.get('category')
        min_price = params.get('min_price')
        max_price = params.get('max_price')

        if make:
            queryset = queryset.filter(make__icontains=make)
        if model:
            queryset = queryset.filter(model__icontains=model)
        if category:
            queryset = queryset.filter(category__icontains=category)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset


class VehiclePurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            vehicle = Vehicle.objects.get(pk=pk)
        except Vehicle.DoesNotExist:
            return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

        if vehicle.quantity <= 0:
            return Response({'detail': 'Vehicle out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

        vehicle.quantity -= 1
        vehicle.save()
        return Response(VehicleSerializer(vehicle).data, status=status.HTTP_200_OK)


class VehicleRestockView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            vehicle = Vehicle.objects.get(pk=pk)
        except Vehicle.DoesNotExist:
            return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

        amount = int(request.data.get('amount', 1))
        if amount <= 0:
            return Response({'detail': 'Restock amount must be positive.'}, status=status.HTTP_400_BAD_REQUEST)
        vehicle.quantity += amount
        vehicle.save()
        return Response(VehicleSerializer(vehicle).data, status=status.HTTP_200_OK)