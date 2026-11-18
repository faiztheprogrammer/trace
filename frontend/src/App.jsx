import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const appName = "Trace";

  const [bugs, setBugs] = useState([]);
  const [newBugTitle, setNewBugTitle] = useState("");
  const [bugError, setBugError] = useState("");
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectError, setProjectError] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");

  async function handleLogin(event) {
    try {
      event.preventDefault();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setToken(data.token);
      setAuthError("");
      fetchBugs(data.token);
      fetchProjects(data.token);
    } catch (error) {
      console.error(error.message);
      setToken(null);
      setAuthError("Auth failed. Please try again");
    }
  }

  async function fetchBugs(myToken, status = "", projectId = "") {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (projectId) params.append("projectId", projectId);

      const query = params.toString();
      const url = query ? `/api/bugs?${query}` : "/api/bugs";

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${myToken}`
        }
      }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setBugs(data);
    } catch (error) {
      console.error(error.message);
      setBackendStatus("Backend unavailable");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(bugId, newStatus) {
    try {
      const response = await fetch(`/api/bugs/${bugId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setBugs(bugs.map((bug) => (bug.id === bugId ? { ...bug, ...data } : bug)));
      setBugError("")
    } catch (error) {
      console.error(error.message);
      setBugError(error.message);
    }
  }

  async function fetchProjects(myToken) {
    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${myToken}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      }

      setProjects(data);
      setProjectError("");
    } catch (error) {
      console.error(error.message);
      setProjectError(error.message);
    }
  }

  async function handleAddBug(event) {
    try {
      event.preventDefault();

      const response = await fetch("/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newBugTitle,
          status: "Open",
          projectId: Number(selectedProjectId)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setBugs([...bugs, data]);
      setNewBugTitle("");
      setBugError("");
    } catch (error) {
      console.log(error.message);
      setBugError(error.message);
    }
  }

  async function handleDeleteBug(bugId) {
    try {
      const response = await fetch(`/api/bugs/${bugId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setBugs(bugs.filter((bug) => bug.id !== bugId));
      setBugError("");
    } catch (error) {
      console.error(error.message);
      setBugError(error.message);
    }
  }

  function handleLogout() {
    setToken(null);
    setBugs([]);
    setProjects([]);
    setFilterStatus("");
    setFilterProjectId("");
    setAuthError("");
    setBugError("");
    setProjectError("");
  }

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }

        setBackendStatus(data.status);
      } catch (error) {
        console.error(error.message);
        setBackendStatus("Backend unavailable");
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="app-container">
      <header className="app-header">
        <div>
          <h1>{appName}</h1>
          <p className="app-subtitle">A project and bug tracking application.</p>
        </div>
        <div className="header-actions">
          <p className="status-badge">
            Backend: {isLoading ? "Loading..." : backendStatus}
          </p>
          {token !== null && <button onClick={handleLogout}>Logout</button>}
        </div>
      </header>

      {token === null && (
        <section className="card">
          <h2>Login</h2>
          <form className="form-row" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          {authError && <p className="error-text">{authError}</p>}
        </section>
      )}

      {token !== null && (
        <>
          <section className="card">
            <h2>Projects ({projects.length})</h2>
            <ul className="project-list">
              {projects.map((project) => (
                <li key={project.id} className="project-pill">{project.name}</li>
              ))}
            </ul>
            {projectError && <p className="error-text">{projectError}</p>}
          </section>

          <section className="card">
            <h2>Add Bug</h2>
            <form className="form-row" onSubmit={handleAddBug}>
              <input
                type="text"
                placeholder="Describe the bug..."
                value={newBugTitle}
                onChange={(event) => setNewBugTitle(event.target.value)}
              />
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <button type="submit">Add Bug</button>
            </form>
            {bugError && <p className="error-text">{bugError}</p>}
          </section>

          <section className="card">
            <h2>Bugs ({bugs.length})</h2>
            <div className="filters-row">
              <select
                value={filterStatus}
                onChange={(event) => {
                  const nextStatus = event.target.value;
                  setFilterStatus(nextStatus);
                  fetchBugs(token, nextStatus, filterProjectId);
                }}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
              <select
                value={filterProjectId}
                onChange={(event) => {
                  const nextProjectId = event.target.value;
                  setFilterProjectId(nextProjectId);
                  fetchBugs(token, filterStatus, nextProjectId);
                }}
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <ol className="bug-list">
              {bugs.map((bug) => (
                <li key={bug.id} className="bug-item">
                  <div className="bug-info">
                    <span className="bug-title">{bug.title}</span>
                    {bug.project_name && (
                      <span className="bug-project">{bug.project_name}</span>
                    )}
                  </div>
                  <div className="bug-actions">
                    <select
                      value={bug.status}
                      onChange={(event) => handleStatusChange(bug.id, event.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button
                      className="danger-btn"
                      onClick={() => handleDeleteBug(bug.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  )
}

export default App