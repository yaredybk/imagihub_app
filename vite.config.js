import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";
// import { manifest } from "./pwa/manifest";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    server: {
        port: 3050,
        // https: {
        //     key: "../server.key",
        //     cert: "../server.crt",
        // },
        // fs: {
        //     allow: [
        //         "./",
        //         "..//public/",
        //         "..//",
        //     ],
        // },
        proxy: {
            "^/(api|files)/.*": {
                secure: false,
                changeOrigin: true,
                target: "https://localhost",
            },
        },
    },
    build: {
        // copyPublicDir: false,
    },
    
    // publicDir: "..//public",
});
