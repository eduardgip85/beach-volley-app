import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.sandset.mobile",
  appName: "Sandset",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
