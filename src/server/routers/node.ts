import { z } from "zod";

import { deleteUploadByUrl } from "@/lib/server/media/storage";
import { router, publicProcedure } from "../trpc";

const nodeMediaSchema = z.object({
  fileId: z.string().optional(),
  url: z.string().min(1),
  type: z.enum(["image", "video", "audio"]),
  thumbnail: z.string().optional(),
  size: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const nodeBaseSchema = z.object({
  title: z.string().min(1).max(64),
  content: z.string().min(1).max(5000),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  tag: z.string().max(32).optional().or(z.literal("")),
  level: z.number().min(1).max(10).default(1),
  media: z.array(nodeMediaSchema).default([]),
});

function normalizeDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

export const nodeRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          q: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const keyword = input?.q;
      return ctx.prisma.node.findMany({
        where: keyword
          ? {
              OR: [
                { title: { contains: keyword, mode: "insensitive" } },
                { content: { contains: keyword, mode: "insensitive" } },
                { tag: { contains: keyword, mode: "insensitive" } },
              ],
            }
          : undefined,
        include: { media: true },
        orderBy: { date: "asc" },
      });
    }),

  create: publicProcedure.input(nodeBaseSchema).mutation(async ({ ctx, input }) => {
    const createdNode = await ctx.prisma.$transaction(async (tx) => {
      const node = await tx.node.create({
        data: {
          title: input.title,
          content: input.content,
          date: normalizeDate(input.date),
          tag: input.tag || null,
          level: input.level,
        },
      });

      for (const media of input.media) {
        if (media.fileId) {
          await tx.media.update({
            where: { id: media.fileId },
            data: {
              nodeId: node.id,
              isTemp: false,
              type: media.type,
              url: media.url,
              thumbnailUrl: media.thumbnail,
              size: media.size ?? 0,
              width: media.width,
              height: media.height,
            },
          });
        } else {
          await tx.media.create({
            data: {
              nodeId: node.id,
              type: media.type,
              url: media.url,
              thumbnailUrl: media.thumbnail,
              filename: media.url.split("/").pop() ?? `manual-${Date.now()}`,
              size: media.size ?? 0,
              width: media.width,
              height: media.height,
              isTemp: false,
            },
          });
        }
      }

      return tx.node.findUniqueOrThrow({
        where: { id: node.id },
        include: { media: true },
      });
    });

    return createdNode;
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        data: nodeBaseSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedNode = await ctx.prisma.$transaction(async (tx) => {
        const existingNode = await tx.node.findUnique({
          where: { id: input.id },
          include: { media: true },
        });
        if (!existingNode) {
          throw new Error("Node not found");
        }

        await tx.node.update({
          where: { id: input.id },
          data: {
            title: input.data.title,
            content: input.data.content,
            date: normalizeDate(input.data.date),
            tag: input.data.tag || null,
            level: input.data.level,
          },
        });

        const keepFileIds = new Set(
          input.data.media
            .map((item) => item.fileId)
            .filter((id): id is string => Boolean(id)),
        );

        const mediasToDelete = existingNode.media.filter((media) => !keepFileIds.has(media.id));
        for (const media of mediasToDelete) {
          await deleteUploadByUrl(media.url);
          await deleteUploadByUrl(media.thumbnailUrl);
          await tx.media.delete({ where: { id: media.id } });
        }

        for (const media of input.data.media) {
          if (media.fileId) {
            await tx.media.update({
              where: { id: media.fileId },
              data: {
                nodeId: input.id,
                isTemp: false,
                type: media.type,
                url: media.url,
                thumbnailUrl: media.thumbnail,
                size: media.size ?? 0,
                width: media.width,
                height: media.height,
              },
            });
            continue;
          }

          await tx.media.create({
            data: {
              nodeId: input.id,
              type: media.type,
              url: media.url,
              thumbnailUrl: media.thumbnail,
              filename: media.url.split("/").pop() ?? `manual-${Date.now()}`,
              size: media.size ?? 0,
              width: media.width,
              height: media.height,
              isTemp: false,
            },
          });
        }

        return tx.node.findUniqueOrThrow({
          where: { id: input.id },
          include: { media: true },
        });
      });

      return updatedNode;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const node = await ctx.prisma.node.findUnique({
        where: { id: input.id },
        include: { media: true },
      });
      if (!node) {
        return { deleted: false };
      }

      for (const media of node.media) {
        await deleteUploadByUrl(media.url);
        await deleteUploadByUrl(media.thumbnailUrl);
      }

      await ctx.prisma.$transaction([
        ctx.prisma.media.deleteMany({ where: { nodeId: input.id } }),
        ctx.prisma.node.delete({ where: { id: input.id } }),
      ]);
      return { deleted: true };
    }),
});
