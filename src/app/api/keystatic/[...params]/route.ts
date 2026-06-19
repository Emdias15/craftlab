import { makeRouteHandler } from "@keystatic/next/route-handler";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require("@/keystatic.config").default;

export const { GET, POST } = makeRouteHandler({ config });
