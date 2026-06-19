import { makeRouteHandler } from "@keystatic/next/route-handler";
// @ts-ignore
import config from "@/keystatic.config";

export const { GET, POST } = makeRouteHandler({ config });
