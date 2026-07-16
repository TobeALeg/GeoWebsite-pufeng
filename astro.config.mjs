import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

export default defineConfig({
  site: "https://pufengwool.com",
  integrations: [sitemap(), icon()],
});
