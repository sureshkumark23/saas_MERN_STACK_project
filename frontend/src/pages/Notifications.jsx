import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load notifications");
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to mark as read");
    }
  };

  if (loading) return <h3>Loading notifications...</h3>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔔 Notifications</h2>

      {notifications.length === 0 && <p>No notifications</p>}

      {notifications.map((n) => (
        <div
          key={n._id}
          style={{
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            backgroundColor: n.read ? "#f9f9f9" : "#e6f0ff",
            cursor: "pointer",
          }}
          onClick={() => markAsRead(n._id)}
        >
          <p>
            <strong>{n.message}</strong>
          </p>

          {n.workspace && (
            <small>Workspace: {n.workspace.name}</small>
          )}
          <br />

          {n.project && (
            <small>Project: {n.project.name}</small>
          )}
          <br />

          {n.task && (
            <small>Task: {n.task.title}</small>
          )}
          <br />

          <small>
            {new Date(n.createdAt).toLocaleString()}
          </small>

          {!n.read && <span style={{ color: "red" }}> ●</span>}
        </div>
      ))}

      <button onClick={() => navigate(-1)}>⬅ Back</button>
    </div>
  );
}

export default Notifications;
