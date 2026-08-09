import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni({
      mp: {
        weixin: {
          setting: {
            usePrivacyCheck: true
          }
        }
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    allowedHosts: ["localhost", "127.0.0.1", "terminal.local"],
  },
});