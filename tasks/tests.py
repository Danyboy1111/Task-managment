from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import Task

User = get_user_model()


class TaskBoardAPITests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', password='pass123', is_staff=True)
        self.user = User.objects.create_user(username='user', password='pass123')

    def test_pagination_returns_page_metadata(self):
        for i in range(15):
            Task.objects.create(
                name=f'Task {i}',
                priority='Medium',
                status='Pending',
                description='Test task',
                created_by=self.admin,
            )

        response = self.client.get(reverse('task-list'), {'page': '2', 'page_size': '10'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 15)
        self.assertEqual(response.json()['page'], 2)
        self.assertEqual(response.json()['total_pages'], 2)
        self.assertEqual(len(response.json()['results']), 5)

    def test_admin_reorder_updates_task_positions(self):
        task_one = Task.objects.create(name='Task 1', priority='High', status='Pending', created_by=self.admin)
        task_two = Task.objects.create(name='Task 2', priority='Low', status='Pending', created_by=self.admin)

        self.client.login(username='admin', password='pass123')
        response = self.client.post(
            reverse('task-reorder'),
            {'items': [{'id': task_two.id, 'position': 1}, {'id': task_one.id, 'position': 2}]},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Task.objects.get(id=task_two.id).position, 1)
        self.assertEqual(Task.objects.get(id=task_one.id).position, 2)

    def test_non_admin_cannot_reorder(self):
        task_one = Task.objects.create(name='Task 1', priority='High', status='Pending', created_by=self.admin)
        task_two = Task.objects.create(name='Task 2', priority='Low', status='Pending', created_by=self.admin)

        self.client.login(username='user', password='pass123')
        response = self.client.post(
            reverse('task-reorder'),
            {'items': [{'id': task_two.id, 'position': 1}, {'id': task_one.id, 'position': 2}]},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)
