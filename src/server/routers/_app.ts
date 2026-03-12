import { router } from "../trpc";
import { mediaRouter } from "./media";
import { nodeRouter } from "./node";

export const appRouter = router({
  node: nodeRouter,
  media: mediaRouter,
});

export type AppRouter = typeof appRouter;
