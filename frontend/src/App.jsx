import { useEffect, useState } from "react";

function App() {
  const appName = "Trace";
  const totalProjects = 3;

  const [bugs, setBugs] = useState([]);

  const [backendStatus, setBackendStatus] = useState("Not checked");
  const [isLoading, setIsLoading] = useState(false);

  async function fetchBugs() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bugs");
    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.error);
    }

    setBugs();
    } catch(error) {
      console.error(error.message);
      setBackendStatus("Backend unavailable");
    } finally {
      setIsLoading(false);
    }
}
  
  async function checkBackend() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.error);
      }
      
      setBackendStatus(data.status);
    } catch(error) {
      console.error(error.message);
      setBackendStatus("Backend unavailable");
    } finally {
      setIsLoading(false);
    }
  }

  function addBug() {
    const newBug = {
      id: bugs.length + 1,
      title: "API response failing",
      status: "Open"
    }

    setBugs([...bugs, newBug]);
  }

  useEffect(() => {
    checkBackend();
    fetchBugs();
  }, [])

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
      <button onClick={addBug}>Add bug</button><br />
    </>
  )
}

export default App