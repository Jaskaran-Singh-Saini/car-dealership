from django.core.management.base import BaseCommand
from users.models import User
from vehicles.models import Vehicle


class Command(BaseCommand):
    help = 'Seed the database with sample users and vehicles.'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_user(
                username='admin',
                email='admin@dealer.com',
                password='admin123',
                role=User.Role.ADMIN,
            )
            self.stdout.write(self.style.SUCCESS('Created admin user (admin@dealer.com / admin123)'))

        if not User.objects.filter(username='user').exists():
            User.objects.create_user(
                username='user',
                email='user@dealer.com',
                password='user123',
                role=User.Role.USER,
            )
            self.stdout.write(self.style.SUCCESS('Created regular user (user@dealer.com / user123)'))

        vehicles = [
            {'make': 'Toyota', 'model': 'Corolla', 'category': 'Sedan', 'price': 22000, 'quantity': 5},
            {'make': 'Toyota', 'model': 'RAV4', 'category': 'SUV', 'price': 28000, 'quantity': 3},
            {'make': 'Honda', 'model': 'Civic', 'category': 'Sedan', 'price': 23500, 'quantity': 4},
            {'make': 'Honda', 'model': 'CR-V', 'category': 'SUV', 'price': 29500, 'quantity': 2},
            {'make': 'Ford', 'model': 'Mustang', 'category': 'Coupe', 'price': 42000, 'quantity': 1},
            {'make': 'Ford', 'model': 'F-150', 'category': 'Truck', 'price': 38000, 'quantity': 6},
            {'make': 'Tesla', 'model': 'Model 3', 'category': 'Sedan', 'price': 41000, 'quantity': 0},
            {'make': 'BMW', 'model': '3 Series', 'category': 'Sedan', 'price': 45000, 'quantity': 2},
            {'make': 'Chevrolet', 'model': 'Camaro', 'category': 'Coupe', 'price': 37000, 'quantity': 3},
            {'make': 'Jeep', 'model': 'Wrangler', 'category': 'SUV', 'price': 33000, 'quantity': 4},
        ]

        created_count = 0
        for data in vehicles:
            _, created = Vehicle.objects.get_or_create(
                make=data['make'], model=data['model'], defaults=data,
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {created_count} vehicles.'))