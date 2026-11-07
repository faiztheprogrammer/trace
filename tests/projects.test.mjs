import { beforeAll, expect, test } from "vitest";
import request from "supertest";
import app from "../app.js";
import { cleanupTestData, createTestProject, createTestUser, ensureTestDatabase } from "./testHelpers.mjs";

beforeAll(ensureTestDatabase);

test("members can read projects but cannot create, update, or delete them", async () => {
    let project;
    let member;
    try {
        project = await createTestProject();
        member = await createTestUser();
        const authorization = `Bearer ${member.token}`;

        const fetched = await request(app)
            .get(`/api/projects/${project.id}`)
            .set("Authorization", authorization);
        expect(fetched.status).toBe(200);
        expect(fetched.body.id).toBe(project.id);

        const created = await request(app)
            .post("/api/projects")
            .set("Authorization", authorization)
            .send({ name: "Not allowed" });
        expect(created.status).toBe(403);

        const updated = await request(app)
            .patch(`/api/projects/${project.id}`)
            .set("Authorization", authorization)
            .send({ name: "Not allowed" });
        expect(updated.status).toBe(403);

        const deleted = await request(app)
            .delete(`/api/projects/${project.id}`)
            .set("Authorization", authorization);
        expect(deleted.status).toBe(403);

        const stillThere = await request(app)
            .get(`/api/projects/${project.id}`)
            .set("Authorization", authorization);
        expect(stillThere.status).toBe(200);
        expect(stillThere.body.name).toBe(project.name);
    } finally {
        await cleanupTestData({ projectId: project?.id, email: member?.email });
    }
});

test("admins can create, rename, and delete projects; deletion cascades to bugs", async () => {
    let admin;
    let projectId;
    try {
        admin = await createTestUser("admin");
        const authorization = `Bearer ${admin.token}`;

        const created = await request(app)
            .post("/api/projects")
            .set("Authorization", authorization)
            .send({ name: "Temporary project" });
        expect(created.status).toBe(201);
        expect(created.body.id).toEqual(expect.any(Number));
        projectId = created.body.id;

        const renamed = await request(app)
            .patch(`/api/projects/${projectId}`)
            .set("Authorization", authorization)
            .send({ name: "Renamed project" });
        expect(renamed.status).toBe(200);
        expect(renamed.body.name).toBe("Renamed project");

        const bug = await request(app)
            .post("/api/bugs")
            .set("Authorization", authorization)
            .send({ title: "Temporary bug", status: "Open", projectId });
        expect(bug.status).toBe(201);
        const bugId = bug.body.id;

        const deleted = await request(app)
            .delete(`/api/projects/${projectId}`)
            .set("Authorization", authorization);
        expect(deleted.status).toBe(204);

        const projectGone = await request(app)
            .get(`/api/projects/${projectId}`)
            .set("Authorization", authorization);
        expect(projectGone.status).toBe(404);

        const bugGone = await request(app)
            .get(`/api/bugs/${bugId}`)
            .set("Authorization", authorization);
        expect(bugGone.status).toBe(404);
    } finally {
        await cleanupTestData({ projectId, email: admin?.email });
    }
});
