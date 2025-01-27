import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        api: "legacy",
        additionalData: `
          $vf-font-plex-sans-prefix: '@visual-framework/vf-font-plex-sans/assets';
          $vf-font-plex-mono-prefix: '@visual-framework/vf-font-plex-mono/assets';
        `,
        importer: [
          (url: string) => {
            if (
              url.startsWith("vf-global-variables") ||
              url.startsWith("vf-variables") ||
              url.startsWith("vf-functions") ||
              url.startsWith("vf-utility-mixins") ||
              url.startsWith("vf-mixins")
            ) {
              const newUrl = "@visual-framework/vf-sass-config";
              return { file: newUrl };
            }
            if (url.startsWith("vf-")) {
              const withoutExtension = url.replace(/\.[^/.]+$/, "");
              const newUrl = `@visual-framework/${withoutExtension}`;
              return { file: newUrl };
            }
            return null;
          },
        ],
      },
    },
  },
});
