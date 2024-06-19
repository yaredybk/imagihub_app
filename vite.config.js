import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";
// import { manifest } from "./pwa/manifest";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // VitePWA({
        //     strategies: "injectManifest",
        //     srcDir: "pwa",
        //     filename: "sw.js",
        //     outDir: "dist",
        //     injectRegister: false,
        //     workbox: {
        //         globDirectory: "dist",
        //         globPatterns: [
        //             "**/*.{js,css,PNG,otf,ttf,html,svg,jpg,png,webp,gif}",
        //         ],
        //         swDest: "dist/sw.js",
        //         ignoreURLParametersMatching: [
        //             /^utm_/,
        //             /^fbclid$/,
        //             /^source/,
        //             /^cols/,
        //             /^cursor/,
        //         ],
        //     },
        //     // registerType
        //     manifest: manifest,
        // }),
    ],
    server: {
        port: 3050,
        https: {
            key: "../garage_server_v2/cert/cert_nov2023_daniel/server.key",
            cert: "../garage_server_v2/cert/cert_nov2023_daniel/server.crt",
        },
        fs: {
            allow: [
                "./",
                // "../garage_web_app_v2/image/",
                "../garage_web_app_v2/public/",
                "../garage_web_app_v2/",
            ],
        },
        proxy: {
            "^/(api|files)/.*": {
                secure: false,
                changeOrigin: true,
                target: "https://localhost",
            },
        },
    },
    build: {
        copyPublicDir: false,
    },
    
    publicDir: "../garage_web_app_v2/public",
});
