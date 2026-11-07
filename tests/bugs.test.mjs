import { beforeAll, expect, test } from "vitest";
import request from "supertest";
import pool from "../db.js";
import app from "../app.js";
import { cleanupTestData, createTestProject, createTestUser, ensureTestDatabase } from "./testHelpers.mjs";

beforeAll(ensureTestDatabase);

test("member can create, read, filter, and update a bug; admin can delete it", async () => {
    let project;
    let member;

    try {
        project = await createTestProject();
        member = await createTestUser();
        const authorization = `Bearer ${member.token}`;

        const created = await request(app)
            .post("/api/bugs")
            .set("Authorization", authorization)
            .send({ title: "Checkout fails", status: "Open", projectId: project.id });

        expect(created.status).toBe(201);
        expect(created.body).toMatchObject({
            title: "Checkout fails",
            status: "Open",
            project_id: project.id
        });
        expect(created.body.id).toEqual(expect.any(Number));
        const bugId = created.body.id;

        const fetched = await request(app)
            .get(`/api/bugs/${bugId}`)
            .set("Authorization", authorization);

        expect(fetched.status).toBe(200);
        expect(fetched.body).toMatchObject({
            id: bugId,
            project_id: project.id,
            project_name: project.name
        });

        const filtered = await request(app)
            .get("/api/bugs")
            .set("Authorization", authorization)
            .query({ projectId: project.id, status: "Open" });

        expect(filtered.status).toBe(200);
        expect(filtered.body.some(bug => bug.id === bugId)).toBe(true);

        const updated = await request(app)
            .patch(`/api/bugs/${bugId}`)
            .set("Authorization", authorization)
            .send({ status: "Closed" });

        expect(updated.status).toBe(200);
        expect(updated.body.status).toBe("Closed");

        const afterUpdate = await request(app)
            .get(`/api/bugs/${bugId}`)
            .set("Authorization", authorization);
        expect(afterUpdate.body.status).toBe("Closed");

        const forbidden = await request(app)
            .delete(`/api/bugs/${bugId}`)
            .set("Authorization", authorization);
        expect(forbidden.status).toBe(403);

        // Promote the same user, then reuse the same valid JWT.
        await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [member.id]);

        const deleted = await request(app)
            .delete(`/api/bugs/${bugId}`)
            .set("Authorization", authorization);
        expect(deleted.status).toBe(204);

        const notFound = await request(app)
            .get(`/api/bugs/${bugId}`)
            .set("Authorization", authorization);
        expect(notFound.status).toBe(404);
    } finally {
        await cleanupTestData({ projectId: project?.id, email: member?.email });
    }
});

test("bug creation rejects invalid title, status, and project ID", async () => {
    let user;
    try {
        user = await createTestUser();
        const authorization = `Bearer ${user.token}`;
        const cases = [
            { title: "  ", status: "Open", projectId: 1 },
            { title: "A bug", status: "Unknown", projectId: 1 },
            { title: "A bug", status: "Open", projectId: -1 }
        ];

        for (const body of cases) {
            const response = await request(app)
                .post("/api/bugs")
                .set("Authorization", authorization)
                .send(body);
            expect(response.status).toBe(400);
        }
    } finally {
        await cleanupTestData({ email: user?.email });
    }
});

test("bug filtering rejects invalid query parameters", async () => {
    let user;
    try {
        user = await createTestUser();
        const authorization = `Bearer ${user.token}`;

        const badStatus = await request(app)
            .get("/api/bugs")
            .set("Authorization", authorization)
            .query({ status: "Unknown" });
        expect(badStatus.status).toBe(400);

        const badProject = await request(app)
            .get("/api/bugs")
            .set("Authorization", authorization)
            .query({ projectId: "abc" });
        expect(badProject.status).toBe(400);

        const validButUnmatched = await request(app)
            .get("/api/bugs")
            .set("Authorization", authorization)
            .query({ projectId: 2147483647 });
        expect(validButUnmatched.status).toBe(200);
        expect(validButUnmatched.body).toEqual([]);
    } finally {
        await cleanupTestData({ email: user?.email });
    }
});
