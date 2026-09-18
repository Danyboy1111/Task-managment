function TaskModal({
  editTask,
  newTask,
  setEditTask,
  setNewTask,
  setImageFile,
  onSave,
  onClose,
}) {
  const updateField = (field, value) => {
    if (editTask) {
      setEditTask({ ...editTask, [field]: value });
    } else {
      setNewTask({ ...newTask, [field]: value });
    }
  };

  return (
    <div className="task-modal-backdrop" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal-header">
          <h3>{editTask ? "Edit Task" : "Create Task"}</h3>
          <button
            className="secondary-btn small-btn icon-btn"
            title="Close task form"
            aria-label="Close task form"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="task-modal-form">
          <input
            type="text"
            placeholder="Task name"
            value={editTask ? editTask.name : newTask.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <select
            value={editTask ? editTask.priority : newTask.priority}
            onChange={(e) => updateField("priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={editTask ? editTask.status : newTask.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="date"
            value={editTask ? (editTask.due_date || "") : (newTask.due_date || "")}
            onChange={(e) => updateField("due_date", e.target.value)}
          />

          {!editTask && (
            <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
          )}

          <textarea
            placeholder="Description"
            value={editTask ? (editTask.description || "") : newTask.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <div className="button-row">
            <button className="primary-btn" onClick={onSave}>
              {editTask ? "Save Changes" : "Add Task"}
            </button>
            <button className="secondary-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
