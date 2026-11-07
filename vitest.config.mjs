import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    if (env.DB_NAME !== "trace_test_db") {
        throw new Error("Tests must use trace_test_db");
    }

    return {
        test: {
            env: {
                DB_NAME: env.DB_NAME
            }
        }
    };
});