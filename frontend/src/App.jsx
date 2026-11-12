import { useState } from "react";

function App() {
  const appName = "Trace";
  const totalProjects = 3;

  const [bugs, setBugs] = useState([
    { id: 1, title: "Login button not working", status: "Open" },
    { id: 2, title: "Dashboard loading slowly", status: "In Progress" },
    { id: 3, title: "Payment request failing", status: "Closed" }
  ]);

  function addBug() {
    const newBug = {
      id: bugs.length + 1,
      title: "New bug",
      status: "Open"
    }

    setBugs([...bugs, newBug]);
  }

  return (
    <>
      <h1>{appName}</h1>
      <p>A project and bug tracking application.</p>
      <p>Total projects: <strong>{totalProjects}</strong></p>

      <ul>
        {bugs.map((bug) => (
          <li key={bug.id}>Title: {bug.title} ----- Status: {bug.status}</li>
        ))}
      </ul>

      <button onClick={addBug}>Add bug</button>
    </>
  )
}

export default App