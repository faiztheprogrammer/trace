const { findProjectById, findAllProjects, addNewProjectRepo } = require('../repositories/projectRepository.js')
async function getProjectById(req, res) {
    try {
        const id = Number(req.params.id);

        if(!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: `Invalid id: ${id}` });
        }

        const project = await findProjectById(id);
        if(!project) {
            return res.status(404).json({ message: "No project found" });
        }

        return res.json(project);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

async function getAllProjects(req, res) {
    try {
        const projects = await findAllProjects();
        return res.json(projects)
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

async function addNewProject(req, res) {
    try {
        const projectInput = req.body;

        if(!projectInput) {
            return res.status(400).json({ message: "Request data not found" });
        }

        const projectName = projectInput.name;
        if(typeof projectName !== "string" || projectName.trim() === "" ) {
            return res.status(400).json({ message: "A valid project name is required" });
        }

        const newProject = await addNewProjectRepo(projectName);
        return res.status(201).json(newProject);
    } catch(error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

module.exports = { getProjectById, getAllProjects, addNewProject }