import { z } from "zod";

const isoDateTime = z.iso.datetime({ offset: true });

export const snippetInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  value: z.string().trim().min(1, "Value is required"),
});

export const snippetRecordSchema = snippetInputSchema.extend({
  id: z.string().min(1),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  lastUsedAt: isoDateTime.optional(),
  useCount: z.number().int().nonnegative(),
});

export const snippetFileSchema = z.object({
  snippets: z.array(snippetRecordSchema).default([]),
});

export const exportBundleSchema = z.object({
  version: z.literal(1),
  exportedAt: isoDateTime,
  snippets: z.array(snippetRecordSchema),
});

export type SnippetInput = z.infer<typeof snippetInputSchema>;
export type SnippetRecord = z.infer<typeof snippetRecordSchema>;
export type ExportBundleV1 = z.infer<typeof exportBundleSchema>;
