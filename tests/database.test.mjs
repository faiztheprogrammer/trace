import { expect, test } from "vitest";
import pool from "../db";

test("test database connection", async () => {
    const result = await pool.query(
        "SELECT current_database() AS name"
    );

    expect(result.rows[0].name).toEqual("trace_test_db");
});

