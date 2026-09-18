from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TaskCommentViewSet, TaskViewSet, login_user, logout_user, me, register_user

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'tasks/(?P<task_pk>[^/.]+)/comments', TaskCommentViewSet, basename='task-comments')

urlpatterns = [
    path('register/', register_user, name='register-user'),
    path('login/', login_user, name='login-user'),
    path('logout/', logout_user, name='logout-user'),
    path('me/', me, name='me'),
    path('', include(router.urls)),
]