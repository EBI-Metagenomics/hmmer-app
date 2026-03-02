import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: `${import.meta.env.VITE_API_URL}/api/v1/openapi.json`,
  output: {
    postProcess: ["prettier", "eslint"],
    path: "./src/client",
  },
  plugins: [
    ...defaultPlugins,
    "zod",
    "@hey-api/schemas",
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    {
      enums: "javascript",
      name: "@hey-api/typescript",
    },
    "@tanstack/react-query",
  ],
});
