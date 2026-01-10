import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Split each language JSON into its own chunk
                    if (id.includes('src/data/ar.json')) return 'quran-ar';
                    if (id.includes('src/data/tr.json')) return 'quran-tr';
                    if (id.includes('src/data/en.json')) return 'quran-en';
                    if (id.includes('src/data/de.json')) return 'quran-de';
                    if (id.includes('src/data/fr.json')) return 'quran-fr';
                    if (id.includes('src/data/zh.json')) return 'quran-zh';
                    if (id.includes('src/data/id.json')) return 'quran-id';
                    if (id.includes('src/data/ur.json')) return 'quran-ur';
                    if (id.includes('src/data/bn.json')) return 'quran-bn';
                    // React and other vendor libs
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) return 'react-vendor';
                        if (id.includes('zustand')) return 'state-vendor';
                        return 'vendor';
                    }
                }
            }
        }
    }
})
