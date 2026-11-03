const { hashPassword, verifyPassword } = require('../utils/password.js');
const { createUserRepo, findUserByEmail } = require('../repositories/userRepository.js');

async function registerUser(req, res) {
    try {
        const requestBody = req.body || {};
        const email = requestBody.email;
        const password = requestBody.password;

        if (typeof email !== "string" || typeof password !== "string" || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const hashedPassword = await hashPassword(password);
        const createUser = await createUserRepo(normalizedEmail, hashedPassword);
        return res.status(201).json(createUser);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "Email already registered" });
        }

        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

async function loginUser(req, res) {
    try {
        const requestBody = req.body || {};
        const email = requestBody.email;
        const password = requestBody.password;

        if (typeof email !== "string" || typeof password !== "string" || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ message: "Invalid input" });
        };

        const normalizedEmail = email.toLowerCase().trim();
        const userFound = await findUserByEmail(normalizedEmail);

        if (!userFound) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const storedPasswordHash = userFound.password_hash;
        const isPasswordValid = await verifyPassword(storedPasswordHash, password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            id: userFound.id,
            email: userFound.email
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

module.exports = { registerUser, loginUser }