import { randomUUID } from "node:crypto";
import request from "supertest";
import pool from "../db.js";
import app from "../app.js";

export async function ensureTestDatabase() {
    const result = await pool.query("SELECT current_database() AS name");
    if (result.rows[0].name !== "trace_test_db") {
        throw new Error("Refusing test writes: database is not trace_test_db");
    }
}

export async function createTestUser(role = "member") {
    await ensureTestDatabase();
    const email = `trace-${randomUUID()}@example.com`;
    const password = "StrongPassword123!";

    const registered = await request(app)
        .post("/api/auth/register")
        .send({ email, password });

    if (registered.status !== 201) {
        throw new Error(`Test user registration failed: ${registered.status}`);
    }

    try {
        if (role === "admin") {
            await pool.query(
                "UPDATE users SET role = $1 WHERE id = $2",
                ["admin", registered.body.id]
            );
        } else if (role !== "member") {
            throw new Error(`Unsupported test role: ${role}`);
        }

        const loggedIn = await request(app)
            .post("/api/auth/login")
            .send({ email, password });

        if (loggedIn.status !== 200 || typeof loggedIn.body.token !== "string") {
            throw new Error(`Test user login failed: ${loggedIn.status}`);
        }

        return { id: registered.body.id, email, token: loggedIn.body.token };
    } catch (error) {
        await pool.query("DELETE FROM users WHERE email = $1", [email]);
        throw error;
    }
}

export async function createTestProject() {
    await ensureTestDatabase();
    const name = `Test project ${randomUUID()}`;
    const result = await pool.query(
        "INSERT INTO projects (name) VALUES ($1) RETURNING id",
        [name]
    );
    return { id: result.rows[0].id, name };
}

export async function cleanupTestData({ projectId, email } = {}) {
    await ensureTestDatabase();
    try {
        if (projectId !== undefined) {
            // Bugs belonging to this project are deleted by ON DELETE CASCADE.
            await pool.query("DELETE FROM projects WHERE id = $1", [projectId]);
        }
    } finally {
        if (email) {
            await pool.query("DELETE FROM users WHERE email = $1", [email]);
        }
    }
}
