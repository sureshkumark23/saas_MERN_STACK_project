import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");

  // 👥 Invite
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  // 📜 Activity feed
  const [activities, setActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);

  // 🔔 Notifications
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔐 Load dashboard
  useEffect(() => {
    const load = async () => {
      try {
        const profile = await api.get("/auth/profile");
        setUser(profile.data.user);

        const ws = await api.get("/workspaces");
        setWorkspaces(ws.data);

        await refreshUnreadCount();

        setLoading(false);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    load();
  }, []);

  const refreshUnreadCount = async () => {
    const res = await api.get("/notifications");
    const unread = res.data.filter(
      (n) => !n.read && !n.isRead
    ).length;
    setUnreadCount(unread);
  };

  // 📜 Fetch activities
  const fetchActivities = async (page = 1) => {
    const res = await api.get(
      `/workspaces/${selectedWorkspace._id}/activities`,
      { params: { page, limit: 10 } }
    );

    if (page === 1) {
      setActivities(res.data.activities);
    } else {
      setActivities((prev) => [...prev, ...res.data.activities]);
    }

    setHasMoreActivities(page < res.data.totalPages);
  };

  useEffect(() => {
    if (selectedWorkspace) {
      setActivityPage(1);
      fetchActivities(1);
    }
  }, [selectedWorkspace]);

  // ➕ Workspace
  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return alert("Workspace name required");

    await api.post("/workspaces", { name: workspaceName });
    setWorkspaceName("");

    const ws = await api.get("/workspaces");
    setWorkspaces(ws.data);

    await refreshUnreadCount();
  };

  // 📁 Projects
  const fetchProjects = async (workspace) => {
    setSelectedWorkspace(workspace);
    setSelectedProject(null);
    setTasks([]);
    setInviteMessage("");

    const res = await api.get(`/workspaces/${workspace._id}/projects`);
    setProjects(res.data);
  };

  // 📌 Tasks
  const fetchTasks = async (projectId) => {
    setSelectedProject(projectId);
    const res = await api.get(`/projects/${projectId}/tasks`);
    setTasks(res.data.tasks);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) return alert("Project name required");

    await api.post(`/workspaces/${selectedWorkspace._id}/projects`, {
      name: projectName,
    });

    setProjectName("");
    const res = await api.get(`/workspaces/${selectedWorkspace._id}/projects`);
    setProjects(res.data);

    await refreshUnreadCount();
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return alert("Task title required");

    await api.post(`/projects/${selectedProject}/tasks`, {
      title: taskTitle,
      priority: taskPriority,
      assignedTo: assignedTo || null,
    });

    setTaskTitle("");
    setTaskPriority("medium");
    setAssignedTo("");

    await fetchTasks(selectedProject);
    fetchActivities(1);
    await refreshUnreadCount();
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    await fetchTasks(selectedProject);
    fetchActivities(1);
    await refreshUnreadCount();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete task?")) return;

    await api.delete(`/tasks/${taskId}`);
    await fetchTasks(selectedProject);
    fetchActivities(1);
    await refreshUnreadCount();
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return alert("Email required");

    const res = await api.post(
      `/workspaces/${selectedWorkspace._id}/invite`,
      { email: inviteEmail }
    );

    setInviteMessage(res.data.message || "User invited");
    setInviteEmail("");

    fetchActivities(1);
    await refreshUnreadCount();
  };

  if (loading) return <h3>Loading...</h3>;

  const isOwner = selectedWorkspace?.owner === user?._id;
  const members = selectedWorkspace?.members || [];

  const todo = tasks.filter((t) => t.status === "todo");
  const progress = tasks.filter((t) => t.status === "in-progress");
  const done = tasks.filter((t) => t.status === "completed");

  return (
    <div>
      <h1>Dashboard</h1>

      {/* 🔔 Notifications */}
      <button
        onClick={() => navigate("/notifications")}
        style={{ position: "relative", marginBottom: "10px" }}
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-10px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <h3>Workspaces</h3>
      <ul>
        {workspaces.map((ws) => (
          <li key={ws._id} onClick={() => fetchProjects(ws)}>
            {ws.name}
          </li>
        ))}
      </ul>

      <input
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
        placeholder="Workspace name"
      />
      <button onClick={handleCreateWorkspace}>Create Workspace</button>

      <hr />

      {selectedWorkspace && (
        <>
          <h3>Projects</h3>
          <ul>
            {projects.map((p) => (
              <li key={p._id} onClick={() => fetchTasks(p._id)}>
                {p.name}
              </li>
            ))}
          </ul>

          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
          />
          <button onClick={handleCreateProject}>Create Project</button>
        </>
      )}

      {selectedWorkspace && isOwner && (
        <>
          <hr />
          <h3>Invite User</h3>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="User email"
          />
          <button onClick={handleInviteUser}>Invite</button>
          {inviteMessage && <p>{inviteMessage}</p>}
        </>
      )}

      {selectedWorkspace && (
        <>
          <hr />
          <h3>Activity Feed</h3>

          {activities.map((a) => (
            <p key={a._id}>
              <strong>{a.user?.name || a.user?.email}</strong>{" "}
              {a.action}
              {a.project && <> in <b>{a.project.name}</b></>}
              {a.task && <> → <i>{a.task.title}</i></>}
            </p>
          ))}

          {hasMoreActivities && (
            <button
              onClick={() => {
                const next = activityPage + 1;
                setActivityPage(next);
                fetchActivities(next);
              }}
            >
              Load more
            </button>
          )}
        </>
      )}

      {selectedProject && (
        <>
          <hr />
          <h3>Tasks</h3>

          {[{ label: "Todo", data: todo, next: "in-progress" },
            { label: "In Progress", data: progress, next: "completed" },
            { label: "Completed", data: done }].map((col) => (
            <div key={col.label}>
              <h4>{col.label}</h4>
              {col.data.map((t) => (
                <p key={t._id}>
                  {t.title}
                  {col.next && (
                    <button onClick={() => updateStatus(t._id, col.next)}>→</button>
                  )}
                  {isOwner && (
                    <button
                      style={{ color: "red", marginLeft: "8px" }}
                      onClick={() => deleteTask(t._id)}
                    >
                      Delete
                    </button>
                  )}
                </p>
              ))}
            </div>
          ))}

          <h4>Create Task</h4>

          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title"
          />

          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.email ?? m._id}
              </option>
            ))}
          </select>

          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button onClick={handleCreateTask}>Create Task</button>
        </>
      )}

      <hr />

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
