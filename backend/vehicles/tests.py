import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from vehicles.models import Vehicle


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def regular_user(db):
    return User.objects.create_user(username='buyer', password='pass12345', role=User.Role.USER)


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='boss', password='pass12345', role=User.Role.ADMIN)


@pytest.fixture
def auth_client(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def sample_vehicle(db):
    return Vehicle.objects.create(make='Toyota', model='Corolla', category='Sedan', price=22000, quantity=5)


@pytest.mark.django_db
class TestVehicleListCreate:
    def test_create_vehicle_authenticated(self, auth_client):
        url = reverse('vehicle-list-create')
        payload = {'make': 'Honda', 'model': 'Civic', 'category': 'Sedan', 'price': 24000, 'quantity': 3}
        response = auth_client.post(url, payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert Vehicle.objects.filter(make='Honda').exists()

    def test_create_vehicle_unauthenticated(self, api_client):
        url = reverse('vehicle-list-create')
        response = api_client.post(url, {'make': 'Honda', 'model': 'Civic', 'category': 'Sedan', 'price': 24000, 'quantity': 3})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_vehicles(self, auth_client, sample_vehicle):
        url = reverse('vehicle-list-create')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1


@pytest.mark.django_db
class TestVehicleSearch:
    def test_search_by_make(self, auth_client, sample_vehicle):
        url = reverse('vehicle-search')
        response = auth_client.get(url, {'make': 'Toyota'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_search_by_price_range(self, auth_client, sample_vehicle):
        url = reverse('vehicle-search')
        response = auth_client.get(url, {'min_price': 30000})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0


@pytest.mark.django_db
class TestVehicleUpdateDelete:
    def test_update_vehicle(self, auth_client, sample_vehicle):
        url = reverse('vehicle-detail', args=[sample_vehicle.id])
        response = auth_client.put(url, {'make': 'Toyota', 'model': 'Corolla', 'category': 'Sedan', 'price': 23000, 'quantity': 5})
        assert response.status_code == status.HTTP_200_OK
        sample_vehicle.refresh_from_db()
        assert sample_vehicle.price == 23000

    def test_delete_vehicle_as_admin(self, admin_client, sample_vehicle):
        url = reverse('vehicle-detail', args=[sample_vehicle.id])
        response = admin_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Vehicle.objects.filter(id=sample_vehicle.id).exists()

    def test_delete_vehicle_as_non_admin_forbidden(self, auth_client, sample_vehicle):
        url = reverse('vehicle-detail', args=[sample_vehicle.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestVehiclePurchaseRestock:
    def test_purchase_decreases_quantity(self, auth_client, sample_vehicle):
        url = reverse('vehicle-purchase', args=[sample_vehicle.id])
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        sample_vehicle.refresh_from_db()
        assert sample_vehicle.quantity == 4

    def test_purchase_fails_when_out_of_stock(self, auth_client, sample_vehicle):
        sample_vehicle.quantity = 0
        sample_vehicle.save()
        url = reverse('vehicle-purchase', args=[sample_vehicle.id])
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_restock_as_admin(self, admin_client, sample_vehicle):
        url = reverse('vehicle-restock', args=[sample_vehicle.id])
        response = admin_client.post(url, {'amount': 10})
        assert response.status_code == status.HTTP_200_OK
        sample_vehicle.refresh_from_db()
        assert sample_vehicle.quantity == 15

    def test_restock_as_non_admin_forbidden(self, auth_client, sample_vehicle):
        url = reverse('vehicle-restock', args=[sample_vehicle.id])
        response = auth_client.post(url, {'amount': 10})
        assert response.status_code == status.HTTP_403_FORBIDDEN