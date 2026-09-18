import { useEffect, useState } from "react";
import "./App.css";
import AuthPage from "./AuthPage";
import DashboardHeader from "./DashboardHeader";
import TaskBoard from "./TaskBoard";
import TaskModal from "./TaskModal";
import TaskDetailPage from "./TaskDetailPage";

const API = "http://127.0.0.1:8000/api/";

const getCookie = (name) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split(";");

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }

  return "";
};

const getCsrfHeaders = () => {
  const token = getCookie("csrftoken");
  return token ? { "X-CSRFToken": token } : {};
};

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ first_name: "", username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [newTask, setNewTask] = useState({
    name: "",
    priority: "Medium",
    status: "Pending",
    description: "",
    due_date: "",
  });
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [dragId, setDragId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageMeta, setPageMeta] = useState({ count: 0, total_pages: 1, page: 1 });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [search, statusFilter, priorityFilter, pageNumber, pageSize, currentUser]);

  const loadUser = async () => {
    const res = await fetch(`${API}me/`, { credentials: "include" });
    const data = await res.json();
    setCurrentUser(data.username ? data : null);
  };

  const login = async () => {
    setAuthError("");
    const res = await fetch(`${API}login/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });

    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      setLoginForm({ username: "", password: "" });
    } else {
      const data = await res.json();
      setAuthError(data.detail || "Login failed.");
    }
  };

  const signup = async () => {
    setAuthError("");
    const res = await fetch(`${API}register/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupForm),
    });

    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      setSignupForm({ first_name: "", username: "", password: "" });
    } else {
      const data = await res.json();
      setAuthError(data.detail || "Account creation failed.");
    }
  };

  const logout = async () => {
    await fetch(`${API}logout/`, {
      method: "POST",
      credentials: "include",
      headers: getCsrfHeaders(),
    });
    setCurrentUser(null);
  };

  const loadTasks = async () => {
    if (!currentUser) return;

    let url = `${API}tasks/?page=${pageNumber}&page_size=${pageSize}&`;

    if (search) url += `search=${search}&`;
    if (statusFilter) url += `status=${statusFilter}&`;
    if (priorityFilter) url += `priority=${priorityFilter}&`;

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();

    if (data.results) {
      setTasks(data.results);
      setPageMeta({ count: data.count, total_pages: data.total_pages, page: data.page });
    } else {
      setTasks(data);
      setPageMeta({ count: data.length, total_pages: 1, page: 1 });
    }
  };

  const openTask = async (taskId) => {
    const res = await fetch(`${API}tasks/${taskId}/`, { credentials: "include" });
    const data = await res.json();
    setSelectedTask(data);
    setEditTask({ ...data });
  };

  const createTask = async () => {
    if (!currentUser || !currentUser.is_staff) return;

    const formData = new FormData();
    formData.append("name", newTask.name);
    formData.append("priority", newTask.priority);
    formData.append("status", newTask.status);
    formData.append("description", newTask.description);
    formData.append("due_date", newTask.due_date);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await fetch(`${API}tasks/`, {
      method: "POST",
      credentials: "include",
      headers: getCsrfHeaders(),
      body: formData,
    });

    if (res.ok) {
      setNewTask({
        name: "",
        priority: "Medium",
        status: "Pending",
        description: "",
        due_date: "",
      });
      setImageFile(null);
      setShowCreateTask(false);
      loadTasks();
    }
  };

  const addComment = async () => {
    if (!selectedTask || !newComment.trim()) return;

    const res = await fetch(`${API}tasks/${selectedTask.id}/add_comment/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
      body: JSON.stringify({ body: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      openTask(selectedTask.id);
    }
  };

  const deleteTask = async (taskId) => {
    const res = await fetch(`${API}tasks/${taskId}/`, {
      method: "DELETE",
      credentials: "include",
      headers: getCsrfHeaders(),
    });

    if (res.ok) {
      setSelectedTask(null);
      loadTasks();
    }
  };

  const exportPdf = (taskId) => {
    window.open(`${API}tasks/${taskId}/export_pdf/`);
  };

  const exportPdfAll = () => {
    window.open(`${API}tasks/export_pdf_list/`);
  };

  const exportExcel = () => {
    window.open(`${API}tasks/export_excel/`);
  };

  const onDragStart = (taskId) => {
    setDragId(taskId);
  };

  const onDrop = async (status) => {
    if (!dragId || !currentUser || !currentUser.is_staff) return;

    const allTasksResponse = await fetch(`${API}tasks/`, { credentials: "include" });
    const allTasksData = await allTasksResponse.json();
    const allTasks = allTasksData.results || allTasksData;
    const draggedTask = allTasks.find((item) => item.id === dragId);

    if (!draggedTask) {
      setDragId(null);
      return;
    }

    const updatedTasks = allTasks.map((item) => {
      if (item.id === dragId) return { ...item, status };
      return item;
    });

    const orderPayload = columns.flatMap((columnName) => {
      const columnItems = updatedTasks.filter((item) => item.status === columnName);
      return columnItems.map((item, index) => ({
        id: item.id,
        position: index + 1,
      }));
    });

    await fetch(`${API}tasks/${dragId}/`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
      body: JSON.stringify({ status }),
    });

    await fetch(`${API}tasks/reorder/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
      body: JSON.stringify({ items: orderPayload }),
    });

    setDragId(null);
    loadTasks();

    if (draggedTask && selectedTask && selectedTask.id === draggedTask.id) {
      openTask(draggedTask.id);
    }
  };

  const saveTaskEdit = async () => {
    if (!editTask) return;

    const res = await fetch(`${API}tasks/${editTask.id}/`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
      body: JSON.stringify({
        name: editTask.name,
        priority: editTask.priority,
        status: editTask.status,
        description: editTask.description,
        due_date: editTask.due_date,
      }),
    });

    if (res.ok) {
      setSelectedTask(null);
      setEditTask(null);
      loadTasks();
    }
  };

  const columns = ["Pending", "In Progress", "Completed"];

  return (
    <div className="app-shell">
      {!currentUser ? (
        <AuthPage
          authMode={authMode}
          setAuthMode={setAuthMode}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          signupForm={signupForm}
          setSignupForm={setSignupForm}
          login={login}
          signup={signup}
          authError={authError}
        />
      ) : (
        <div className="board-page">
          <DashboardHeader
            currentUser={currentUser}
            onExportPdf={exportPdfAll}
            onCreateTask={() => {
              setNewTask({
                name: "",
                priority: "Medium",
                status: "Pending",
                description: "",
                due_date: "",
              });
              setImageFile(null);
              setShowCreateTask(true);
              setEditTask(null);
            }}
            onExportExcel={exportExcel}
            onLogout={logout}
          />

          <div className="filters">
            <input
              type="text"
              placeholder="Search task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>

          <div className="info-bar">
            <span>Total tasks: {pageMeta.count}</span>
            <span>Page {pageMeta.page} / {pageMeta.total_pages}</span>
          </div>

          <div className="pagination">
            <button className="secondary-btn" disabled={pageNumber <= 1} onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}>Previous</button>
            <button className="secondary-btn" disabled={pageNumber >= pageMeta.total_pages} onClick={() => setPageNumber((prev) => prev + 1)}>Next</button>
          </div>

          <TaskBoard
            tasks={tasks}
            columns={columns}
            currentUser={currentUser}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onOpenTask={openTask}
            onDeleteTask={deleteTask}
          />

          {(showCreateTask || (editTask && !selectedTask)) && (
            <TaskModal
              editTask={editTask}
              newTask={newTask}
              setEditTask={setEditTask}
              setNewTask={setNewTask}
              setImageFile={setImageFile}
              onSave={editTask ? saveTaskEdit : createTask}
              onClose={() => {
                setShowCreateTask(false);
                setEditTask(null);
              }}
            />
          )}

          {selectedTask && (
            <TaskDetailPage
              selectedTask={selectedTask}
              currentUser={currentUser}
              editTask={editTask}
              setEditTask={setEditTask}
              newComment={newComment}
              setNewComment={setNewComment}
              onBack={() => {
                setSelectedTask(null);
                setEditTask(null);
              }}
              onSave={saveTaskEdit}
              onDelete={(taskId) => {
                deleteTask(taskId);
                setSelectedTask(null);
                setEditTask(null);
              }}
              onExportPdf={exportPdf}
              onAddComment={addComment}
            />
          )}

        </div>
      )}
    </div>
  );
}

export default App;