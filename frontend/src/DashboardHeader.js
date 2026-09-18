function DashboardHeader({ currentUser, onExportPdf, onCreateTask, onExportExcel, onLogout }) {
  return (
    <div className="topbar">
      <div>
        <p className="eyebrow">Team Workspace</p>
        <h2>Task Board</h2>
      </div>

      <div className="topbar-actions">
        <span className="user-badge">
          {currentUser.username} {currentUser.is_staff ? "(Admin)" : "(User)"}
        </span>
        {currentUser.is_staff && (
          <button className="primary-btn" onClick={onCreateTask}>Create Task</button>
        )}
        <button className="secondary-btn" onClick={onExportPdf}>Export PDF</button>
        <button className="secondary-btn" onClick={onExportExcel}>Export Excel</button>
        <button className="secondary-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

export default DashboardHeader;
