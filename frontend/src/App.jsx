import { useEffect, useState } from "react";

function App() {
  const appName = "Trace";
  const totalProjects = 3;

  const [bugs, setBugs] = useState([
    { id: 1, title: "Login button not working", status: "Open" },
    { id: 2, title: "Dashboard loading slowly", status: "In Progress" },
    { id: 3, title: "Payment request failing", status: "Closed" }
  ]);

  const [backendStatus, setBackendStatus] = useState("Not checked");

  async function checkBackend() {
    const response = await fetch("/api/health");
    const data = await response.json();

    setBackendStatus(data.status);
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

      <p>Backend status: {backendStatus}</p>
      <button onClick={addBug}>Add bug</button><br />
    </>
  )
}

export default App