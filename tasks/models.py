from django.db import models
import uuid
from django.conf import settings
from django.utils import timezone


class Task(models.Model):
    STATUS_PENDING = "Pending"
    STATUS_IN_PROGRESS = "In Progress"
    STATUS_COMPLETED = "Completed"

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    ]

    PRIORITY_LOW = "Low"
    PRIORITY_MEDIUM = "Medium"
    PRIORITY_HIGH = "High"

    PRIORITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    name = models.CharField(max_length=200)
    task_code = models.CharField(max_length=50, unique=True, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="Medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to="task_images/", null=True, blank=True)
    position = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tasks"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["position", "due_date", "created_at"]

    def __str__(self):
        return f"{self.task_code} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.task_code:
            stamp = timezone.now().strftime("%Y%m%d%H%M%S")
            unique = uuid.uuid4().hex[:6].upper()
            self.task_code = f"TASK-{stamp}-{unique}"
        super().save(*args, **kwargs)


class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="task_comments"
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment on {self.task.task_code}"