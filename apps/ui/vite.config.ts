// Vite yapılandırması (D-26 · FAZ-4.2b).
//
// **Proxy zorunlu:** UI `/api/*` çağırır ve Vite dev sunucusu onları Hono'ya iletir.
// Mutlak URL yazmak (`http://localhost:5177/api/...`) portu iki yere gömerdi ve
// üretimde tek kökten servis ederken kırılırdı.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API = process.env['SUITE_PORT'] ?? '5177'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${API}`,
        changeOrigin: true,
        // SSE akışı tamponlanmamalı: tamponlanırsa nabız geç gelir ve şerit
        // durup dururken "bayat" der — yani ölçüm aracının kendisi ölçümü bozar.
        ws: false,
      },
    },
  },
  build: { outDir: 'dist-web', emptyOutDir: true },
})
