const { hashPassword } = require('../utils/password.js');
const { createUserRepo } = require('../repositories/userRepository.js');

async function registerUser(req, res) {
    try {
        const requestBody = req.body || {};
        const email = requestBody.email;
        const password = requestBody.password;

        if (typeof email !== "string" || typeof password !== "string" || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const hashedPassword = await hashPassword(password);
        const createUser = await createUserRepo(normalizedEmail, hashedPassword);
        return res.status(201).json(createUser);
    } catch (error) {
        if(error.code === "23505") {
            return res.status(409).json({ message: "Email already registered" });
        }
        
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

module.exports = { registerUser }