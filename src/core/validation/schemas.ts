import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24).optional(),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    z.object({
      success: z.literal(true),
      data: dataSchema,
      meta: z
        .object({
          page: z.number().optional(),
          limit: z.number().optional(),
          total: z.number().optional(),
          totalPages: z.number().optional(),
          timestamp: z.string().optional(),
        })
        .optional(),
    }),
    z.object({
      success: z.literal(false),
      error: apiErrorSchema,
    }),
  ]);
