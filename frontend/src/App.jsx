import { useState } from "react";

function App() {
  const appName = "Trace";
  const totalProjects = 3;

  const [totalBugs, setTotalBugs] = useState(15);
  return (
    <>
      <h1>{appName}</h1>
      <p>A project and bug tracking application.</p>
      <p>Total projects: <strong>{totalProjects}</strong></p>
      <p>{totalBugs === 0 ?
        "No bugs reported"
        : `Total bugs: ${totalBugs}`}
      </p>

      <button onClick={() => setTotalBugs(totalBugs + 1)}>
        Add bug
      </button><br />
      <button onClick={() => {
        if (totalBugs > 0) {
          setTotalBugs(totalBugs - 1)
        }
      }}>Remove bugs</button>
    </>
  )
}

export default App