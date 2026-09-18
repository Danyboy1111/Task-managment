function TaskBoard({
  tasks,
  columns,
  currentUser,
  onDragStart,
  onDrop,
  onOpenTask,
  onDeleteTask,
}) {
  return (
    <div className="board">
      {columns.map((status) => (
        <div
          className="column"
          key={status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(status)}
        >
          <h3>{status}</h3>

          {tasks
            .filter((task) => task.status === status)
            .map((task) => (
              <div
                className="task-card"
                key={task.id}
                draggable={currentUser && currentUser.is_staff}
                onDragStart={() => onDragStart(task.id)}
              >
                <div className="task-card-header" onClick={() => onOpenTask(task.id)}>
                  {task.image && <img src={task.image} alt={task.name} className="task-thumb" />}
                  <strong>{task.name}</strong>
                  <small>{task.task_code}</small>
                  <p>{task.priority}</p>
                </div>

                {currentUser && currentUser.is_staff && (
                  <div className="task-card-actions">
                    <button
                      className="danger-btn small-btn icon-btn"
                      title="Delete task"
                      aria-label="Delete task"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                    >
                      &#128465;
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;
