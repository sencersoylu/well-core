import { z } from "zod";
import data from "./citations.json" with { type: "json" };

export const CitationSchema = z.object({
  title: z.string().min(1),
  phrasing_en: z.string().min(1),
  what_it_does_not_show: z.string().min(1),
  source: z.object({
    authors: z.string().min(1),
    year: z.number().int().min(1900).max(2100),
    journal: z.string().min(1),
    doi: z.string().min(1).optional(),
    pmid: z.string().min(1).optional(),
    url: z.string().url().optional(),
  }),
});

export type Citation = z.infer<typeof CitationSchema>;
export type CitationTag = keyof typeof data;

export const citations: Record<string, Citation> = data as Record<string, Citation>;

export function getCitation(tag: string): Citation | undefined {
  return citations[tag];
}
