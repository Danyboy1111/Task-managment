function TaskDetailPage({
  selectedTask,
  currentUser,
  editTask,
  setEditTask,
  newComment,
  setNewComment,
  onBack,
  onSave,
  onDelete,
  onExportPdf,
  onAddComment,
}) {
  return (
    <div
      className="task-detail-page"
      onClick={(event) => {
        if (event.target === event.currentTarget) onBack();
      }}
    >
      <div className="detail-box task-detail-card">
        <div className="task-detail-header">
          <div className="task-detail-actions">
            <button className="secondary-btn" onClick={() => onExportPdf(selectedTask.id)}>
              Export PDF
            </button>
            {currentUser && currentUser.is_staff && (
              <button className="danger-btn icon-btn" onClick={() => onDelete(selectedTask.id)} title="Delete task" aria-label="Delete task">
                &#128465;
              </button>
            )}
          </div>
        </div>

        <h3>{selectedTask.name}</h3>

        {currentUser && currentUser.is_staff ? (
          <div className="task-edit-form">
            <input
              value={editTask ? editTask.name : selectedTask.name}
              onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
            />

            <div className="detail-grid">
              <select
                value={editTask ? editTask.priority : selectedTask.priority}
                onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <select
                value={editTask ? editTask.status : selectedTask.status}
                onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <input
              type="date"
              value={editTask ? (editTask.due_date || "") : (selectedTask.due_date || "")}
              onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
            />

            <textarea
              value={editTask ? (editTask.description || "") : (selectedTask.description || "")}
              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
            />

          </div>
        ) : (
          <>
            <p><strong>Code:</strong> {selectedTask.task_code}</p>
            <p><strong>Priority:</strong> {selectedTask.priority}</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
            <p><strong>Due:</strong> {selectedTask.due_date || "N/A"}</p>
            {selectedTask.image && <img src={selectedTask.image} alt={selectedTask.name} className="detail-image" />}
            <p>{selectedTask.description}</p>
          </>
        )}

        {selectedTask.image && currentUser && currentUser.is_staff && (
          <div className="image-preview-wrap">
            <img src={selectedTask.image} alt={selectedTask.name} className="detail-image" />
          </div>
        )}

        <div className="comment-box">
          <h4>Comments</h4>
          {selectedTask.comments && selectedTask.comments.length > 0 ? (
            selectedTask.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <strong>{comment.author_name}</strong>
                <p>{comment.body}</p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add comment"
          />
          <div className="comment-actions">
            <button className="primary-btn" onClick={onAddComment}>Add Comment</button>
            {currentUser && currentUser.is_staff && (
              <button className="primary-btn" onClick={onSave}>Save Changes</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailPage;
