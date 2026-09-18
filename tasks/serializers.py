from rest_framework import serializers
from .models import Task, TaskComment


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskComment
        fields = ["id", "task", "author_name", "body", "created_at"]
        read_only_fields = ["id", "author_name", "created_at"]

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return "System"


class TaskSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    comments = TaskCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [ "id", "name", "task_code", "priority", "status",
                   "description", "due_date", "image", "position", "created_by", "created_at",
                     "updated_at", "comments"]
        read_only_fields = [
            "id", "task_code", "created_by", "created_at", "updated_at", "comments"
        ]

    def get_image(self, obj):
        if not obj.image:
            return None

        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url