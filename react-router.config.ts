import type { Config } from "@react-router/dev/config";

export default {
  // Enable SPA mode for static deployment
  ssr: false,
  // Configure for static export
  prerender: ["/"],
} satisfies Config;
