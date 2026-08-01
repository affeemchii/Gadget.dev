import { RouteContext } from "gadget-server";

export default async function route({ reply }: RouteContext) {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type, x-shopify-shop-domain");
  reply.code(204).send();
}
