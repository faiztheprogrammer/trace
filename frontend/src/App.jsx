import { useEffect, useState } from "react";

function App() {
  const appName = "Trace";
  const totalProjects = 3;

  const [bugs, setBugs] = useState([]);
  const [newBugTitle, setNewBugTitle] = useState("");
  const [backendStatus, setBackendStatus] = useState("Not checked");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState("");

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
    } catch (error) {
      console.error(error.message);
      setToken(null);
      setAuthError("Auth failed. Please try again");
    }
  }

  async function fetchBugs(myToken) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bugs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${myToken}`
        }
      }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setBugs(data);
    } catch (error) {
      console.error(error.message);
      setBackendStatus("Backend unavailable");
    } finally {
      setIsLoading(false);
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
          projectId: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setBugs([...bugs, data]);
      setNewBugTitle("");
    } catch (error) {
      console.log(error.message);
    }
  }

  async function checkBackend() {
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <>
      <h1>{appName}</h1>
      <p>A project and bug tracking application.</p>
      <p>Total projects: <strong>{totalProjects}</strong></p>

      <p>Total bugs: <strong>{bugs.length}</strong></p>
      <ul>
        {bugs.map((bug) => (
          <li key={bug.id}>Title: {bug.title} ----- Status: {bug.status}</li>
        ))}
      </ul>

      <p>Backend Status: {isLoading ? "Checking..." : backendStatus}</p>

      <form action="" onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      {authError && <p>{authError}</p>}
      {token !== null && <p>Authenticated successfully</p>}

      <form action="" onSubmit={handleAddBug}>
        <input type="text" value={newBugTitle} onChange={(event) => setNewBugTitle(event.target.value)}/>
        <button type="submit">Add Bug</button>
      </form>
    </>
  )
}

export default App