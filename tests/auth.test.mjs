import { test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import pool from "../db.js";
import { randomUUID } from "node:crypto";

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

