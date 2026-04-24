import { z } from "zod";

export const analyticsEventNameSchema = z.enum([
  "page_view",
  "cta_click",
  "sponsor_click",
  "form_submit",
  "stream_interaction",
]);

export const analyticsEventSchema = z.object({
  eventName: analyticsEventNameSchema,
  pagePath: z.string().trim().min(1).max(200),
  pageTitle: z.string().trim().max(200).optional().or(z.literal("")),
  referrer: z.string().trim().max(500).optional().or(z.literal("")),
  visitorId: z.string().trim().min(1).max(120),
  sessionId: z.string().trim().min(1).max(120),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
export type AnalyticsEventName = z.infer<typeof analyticsEventNameSchema>;