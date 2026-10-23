import { createApp } from "@backstage/frontend-defaults";
import apiDocsPlugin from "@backstage/plugin-api-docs/alpha";
import catalogPlugin from "@backstage/plugin-catalog/alpha";

export default createApp({
  features: [catalogPlugin, apiDocsPlugin],
});
