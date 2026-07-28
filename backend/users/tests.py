import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestRegister:
    def test_register_success(self, api_client):
        url = reverse('register')
        payload = {'username': 'john', 'email': 'john@test.com', 'password': 'strongpass123'}
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'tokens' in response.data
        assert User.objects.filter(username='john').exists()

    def test_register_duplicate_email(self, api_client):
        User.objects.create_user(username='existing', email='dup@test.com', password='pass12345')
        url = reverse('register')
        payload = {'username': 'newuser', 'email': 'dup@test.com', 'password': 'strongpass123'}
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client):
        User.objects.create_user(username='john', password='strongpass123')
        url = reverse('login')
        response = api_client.post(url, {'username': 'john', 'password': 'strongpass123'})
        assert response.status_code == status.HTTP_200_OK
        assert 'tokens' in response.data

    def test_login_wrong_password(self, api_client):
        User.objects.create_user(username='john', password='strongpass123')
        url = reverse('login')
        response = api_client.post(url, {'username': 'john', 'password': 'wrongpass'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST