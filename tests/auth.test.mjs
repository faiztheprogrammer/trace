import { test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import pool from "../db.js";
import { randomUUID } from "node:crypto";
import { cleanupTestData } from "./testHelpers.mjs";

test("DELETE /api/bugs/:id rejects unauthenticated requests", async () => {
    const response = await request(app).delete("/api/bugs/9999");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
        message: "Authentication required"
    });
});

test("DELETE /api/bugs/:id rejects invalid JWTs", async () => {
    const response = await request(app)
        .delete("/api/bugs/9999")
        .set("Authorization", "Bearer fake-token-123");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
        message: "Invalid or expired token"
    });
});

test("POST /api/auth/register rejects invalid email format", async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
            email: "not-an-email",
            password: "StrongPassword123!"
        });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
        message: "Invalid email format"
    });
});

test("POST /api/auth/register creates a user", async () => {
    const email = `test-${randomUUID()}@example.com`;

    try {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: email,
                password: "StrongPassword123!"
            });

        expect(response.status).toBe(201);
        expect(response.body.email).toEqual(email);
        expect(response.body).toHaveProperty("id");

    } finally {
        await pool.query(
            "DELETE FROM users WHERE email = $1",
            [email]
        );
    }
});

test("Registered users can log in successfully", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const password = "StrongPassword123!";

    try {
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                email: email,
                password: password
            });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toHaveProperty("id");

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: email,
                password: password
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty("token");
        expect(loginResponse.body.email).toBe(email);
    } finally {
        await pool.query(
            "DELETE FROM users WHERE email = $1",
            [email]
        );
    }
});

test("Cannot log in with an incorrect password", async () => {
    const email = `test-${randomUUID()}@gmail.com`;
    const password = "StrongPassword!";
    const wrongPassword = "wrong123";

    try {
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                email: email,
                password: password
            });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toHaveProperty("id");
        expect(registerResponse.body.email).toBe(email);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: email,
                password: wrongPassword
            });

        expect(loginResponse.status).toBe(401);
        expect(loginResponse.body).toEqual({
            message: "Invalid credentials"
        });
        expect(loginResponse.body).not.toHaveProperty("token");
    } finally {
        await pool.query(
            'DELETE FROM users WHERE email = $1',
            [email]
        );
    }
});

test("Role changes immediately affect authorization", async () => {
    const email = `test-${randomUUID()}@gmail.com`;
    const password = 'TracePassword';

    try {
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                email: email,
                password: password
            });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body.email).toBe(email);

        // Promote the member to 'admin'
        await pool.query(
            'UPDATE users SET role = $1 WHERE email = $2',
            ["admin", email]
        );

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: email,
                password: password
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty("token");

        const token = loginResponse.body.token;

        // Try deleting a non-existent bug
        const responseOne = await request(app)
            .delete("/api/bugs/99999")
            .set("Authorization", `Bearer ${token}`);

        expect(responseOne.status).toBe(404);

        // Demote the user to member again
        await pool.query(
            'UPDATE users SET role = $1 WHERE email = $2',
            ["member", email]
        );

        const responseTwo = await request(app)
            .delete("/api/bugs/99999")
            .set("Authorization", `Bearer ${token}`);

        expect(responseTwo.status).toBe(403);
        expect(responseTwo.body).toEqual({
            message: "Admin access required"
        });

    } finally {
        await pool.query(
            'DELETE FROM users WHERE email = $1',
            [email]
        );
    }
});

test("registration rejects a duplicate email with 409", async () => {
    const email = `trace-${randomUUID()}@example.com`;
    const body = { email, password: "StrongPassword123!" };
    try {
        const first = await request(app).post("/api/auth/register").send(body);
        expect(first.status).toBe(201);

        const second = await request(app).post("/api/auth/register").send(body);
        expect(second.status).toBe(409);
        expect(second.body).toEqual({ message: "Email already registered" });
    } finally {
        await cleanupTestData({ email });
    }
});

test("unknown email returns 401 without a token", async () => {
    const response = await request(app)
        .post("/api/auth/login")
        .send({
            email: `nobody-${randomUUID()}@example.com`,
            password: "StrongPassword123!"
        });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid credentials" });
    expect(response.body).not.toHaveProperty("token");
});

test("reading bugs without a JWT returns 401", async () => {
    const response = await request(app).get("/api/bugs");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Authentication required" });
});
