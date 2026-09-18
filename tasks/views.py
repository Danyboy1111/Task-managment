import math

from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Task, TaskComment
from .serializers import TaskCommentSerializer, TaskSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user is None:
        return Response({'detail': 'Invalid username or password.'}, status=401)

    login(request, user)
    return Response({
        'username': user.username,
        'is_staff': user.is_staff,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    logout(request)
    return Response({'detail': 'Logged out'})


@api_view(['GET'])
@permission_classes([AllowAny])
def me(request):
    if request.user.is_authenticated:
        return Response({
            'username': request.user.username,
            'is_staff': request.user.is_staff,
        })
    return Response({'username': None, 'is_staff': False})


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]
    queryset = Task.objects.all().order_by('position', 'due_date', 'created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page_size = request.query_params.get('page_size')
        page = request.query_params.get('page', 1)

        if page_size and page_size.isdigit() and int(page_size) > 0:
            page_number = int(page) if str(page).isdigit() and int(page) > 0 else 1
            page_size_number = int(page_size)
            start = (page_number - 1) * page_size_number
            end = start + page_size_number
            total_items = queryset.count()
            total_pages = math.ceil(total_items / page_size_number) if page_size_number else 1

            paginated_items = queryset[start:end]
            serializer = self.get_serializer(paginated_items, many=True, context={'request': request})

            return Response({
                'count': total_items,
                'page': page_number,
                'page_size': page_size_number,
                'total_pages': total_pages,
                'results': serializer.data,
            })

        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Task.objects.all()
        search = self.request.query_params.get('search', '').strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(task_code__icontains=search) |
                Q(description__icontains=search)
            )

        status_filter = self.request.query_params.get('status')
        priority_filter = self.request.query_params.get('priority')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)

        return queryset.order_by('due_date', 'position', 'created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_staff:
            return super().create(request, *args, **kwargs)
        return Response({'detail': 'Admin only.'}, status=403)

    def update(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_staff:
            return super().update(request, *args, **kwargs)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        allowed_fields = {'status'}
        data = request.data.copy()

        for key in list(data.keys()):
            if key not in allowed_fields:
                data.pop(key)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'detail': 'Admin only.'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'detail': 'Admin only.'}, status=403)

        items = request.data.get('items', [])
        for item in items:
            task_id = item.get('id')
            position = item.get('position')
            if task_id is not None and position is not None:
                Task.objects.filter(id=task_id).update(position=position)

        return Response({'detail': 'Tasks reordered successfully.'}, status=200)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        body = request.data.get('body', '').strip()

        if not body:
            return Response({'detail': 'Comment body cannot be empty'}, status=400)

        comment = TaskComment.objects.create(task=task, author=request.user, body=body)
        serializer = TaskCommentSerializer(comment, context={'request': request})
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        task = self.get_object()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{task.task_code}.pdf"'

        page = canvas.Canvas(response, pagesize=letter)
        page.drawString(70, 750, f'Task: {task.name}')
        page.drawString(70, 730, f'Task Code: {task.task_code}')
        page.drawString(70, 710, f'Priority: {task.priority}')
        page.drawString(70, 690, f'Status: {task.status}')
        page.drawString(70, 670, f'Due: {task.due_date or "N/A"}')
        page.drawString(70, 650, 'Description:')
        text = page.beginText(70, 630)
        text.textLine(task.description or 'No description provided.')
        page.drawText(text)
        page.showPage()
        page.save()

        return response

    @action(detail=False, methods=['get'])
    def export_pdf_list(self, request):
        tasks = Task.objects.all().order_by('position', 'due_date', 'created_at')
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="task-board.pdf"'

        page = canvas.Canvas(response, pagesize=letter)
        y = 750
        for task in tasks:
            if y < 120:
                page.showPage()
                y = 750

            page.drawString(70, y, f'{task.task_code} - {task.name}')
            y -= 20
            page.drawString(70, y, f'Priority: {task.priority} | Status: {task.status} | Due: {task.due_date or "N/A"}')
            y -= 20
            description = (task.description or 'No description provided.')
            lines = description.splitlines() or ['No description provided.']
            for line in lines[:4]:
                page.drawString(70, y, line[:90])
                y -= 16
                if y < 80:
                    page.showPage()
                    y = 750
                    break
            y -= 10

        page.save()
        return response

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        import openpyxl
        from io import BytesIO

        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = 'Tasks'
        sheet.append(['Task Code', 'Name', 'Priority', 'Status', 'Due Date'])

        for task in Task.objects.all().order_by('position', 'due_date'):
            sheet.append([task.task_code, task.name, task.priority, task.status, task.due_date or ''])

        output = BytesIO()
        workbook.save(output)
        output.seek(0)

        response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="tasks.xlsx"'
        return response


class TaskCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCommentSerializer
    permission_classes = [AllowAny]
    queryset = TaskComment.objects.all()

    def get_queryset(self):
        return TaskComment.objects.filter(task_id=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        task = Task.objects.get(pk=self.kwargs['task_pk'])
        serializer.save(task=task, author=self.request.user)