import { z } from "zod";
import { MediaType } from "@prisma/client";

import { deleteUploadByUrl, getFileIdFromUrl, storeUploadedFile } from "@/lib/server/media/storage";
import { router, publicProcedure } from "../trpc";

export const mediaRouter = router({
  createTempFromFormData: publicProcedure
    .input(
      z.object({
        file: z.instanceof(File),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const storedAsset = await storeUploadedFile(input.file);
      const created = await ctx.prisma.media.create({
        data: {
          type: MediaType[storedAsset.type],
          url: storedAsset.url,
          thumbnailUrl: storedAsset.thumbnailUrl,
          filename: storedAsset.filename,
          size: storedAsset.size,
          width: storedAsset.width,
          height: storedAsset.height,
          isTemp: true,
        },
      });

      return {
        fileId: created.id,
        url: created.url,
        type: created.type.toLowerCase(),
        size: created.size,
        thumbnail: created.thumbnailUrl ?? undefined,
        width: created.width ?? undefined,
        height: created.height ?? undefined,
      };
    }),

  cleanTemp: publicProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const medias = await ctx.prisma.media.findMany({
        where: { id: { in: input.fileIds }, isTemp: true },
      });

      for (const media of medias) {
        await deleteUploadByUrl(media.url);
        await deleteUploadByUrl(media.thumbnailUrl);
      }

      const deleted = await ctx.prisma.media.deleteMany({
        where: { id: { in: medias.map((item) => item.id) }, isTemp: true },
      });
      return { deletedCount: deleted.count };
    }),

  deleteOne: publicProcedure
    .input(
      z.object({
        fileId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.prisma.media.findUnique({ where: { id: input.fileId } });
      if (!media) {
        return { deleted: false };
      }

      await deleteUploadByUrl(media.url);
      await deleteUploadByUrl(media.thumbnailUrl);
      await ctx.prisma.media.delete({ where: { id: input.fileId } });
      return { deleted: true, fileId: input.fileId };
    }),

  deleteByFilename: publicProcedure
    .input(
      z.object({
        filename: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.prisma.media.findFirst({
        where: {
          OR: [{ filename: input.filename }, { url: `/uploads/${input.filename}` }],
        },
      });
      if (!media) {
        return { deleted: false };
      }
      await deleteUploadByUrl(media.url);
      await deleteUploadByUrl(media.thumbnailUrl);
      await ctx.prisma.media.delete({ where: { id: media.id } });
      return { deleted: true, fileId: media.id };
    }),

  extractFileIdFromUrl: publicProcedure
    .input(z.object({ url: z.string().min(1) }))
    .query(({ input }) => ({
      fileId: getFileIdFromUrl(input.url),
    })),
});
