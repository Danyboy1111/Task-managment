from django.contrib import admin
from .models import Task, TaskComment

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('task_code', 'name', 'priority', 'status', 'due_date', 'created_by', 'created_at')
    list_filter=['status','priority']
    search_fields = ['task_code', 'name', 'description']

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at')
    search_fields = ['body']