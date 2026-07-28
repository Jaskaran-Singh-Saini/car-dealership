from django.urls import path
from .views import (
    VehicleListCreateView,
    VehicleDetailView,
    VehicleSearchView,
    VehiclePurchaseView,
    VehicleRestockView,
)

urlpatterns = [
    path('search', VehicleSearchView.as_view(), name='vehicle-search'),
    path('<int:pk>/purchase', VehiclePurchaseView.as_view(), name='vehicle-purchase'),
    path('<int:pk>/restock', VehicleRestockView.as_view(), name='vehicle-restock'),
    path('<int:pk>', VehicleDetailView.as_view(), name='vehicle-detail'),
    path('', VehicleListCreateView.as_view(), name='vehicle-list-create'),
]