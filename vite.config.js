import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	// Legge la variabile d'ambiente. Se è 'gh-pages', usa il percorso per GitHub.
   // Altrimenti, usa './' come default, che è perfetto per Android/Capacitor.
  base: process.env.VITE_DEPLOY_TARGET === 'gh-pages' ? '/quiztartufi/' : './',
  plugins: [react(),tailwindcss(),],
})
