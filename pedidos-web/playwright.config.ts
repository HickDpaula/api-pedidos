import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const isWindows = process.platform === 'win32'
const backendDir = path.resolve(dirname, '../pedidos-api')
const backendCommand = isWindows ? '.\\mvnw.cmd spring-boot:run' : './mvnw spring-boot:run'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: backendCommand,
      cwd: backendDir,
      port: 8080,
      timeout: 120_000,
      reuseExistingServer: false,
      env: { SPRING_PROFILES_ACTIVE: 'e2e' },
    },
    {
      command: 'npm run dev',
      port: 5173,
      timeout: 30_000,
      reuseExistingServer: false,
    },
  ],
})
