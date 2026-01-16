import { z } from "zod";

export const urlSchema = z.string().url({ message: "Invalid URL format. Must include http:// or https://" });
export const emailSchema = z.string().email({ message: "Invalid email address." });
export const uuidSchema = z.string().uuid({ message: "Invalid ID format." });

export const scanSchema = z.object({
    url: urlSchema,
    site_id: uuidSchema.optional().nullable(),
    sync: z.boolean().optional(),
});

export const planSchema = z.object({
    user_domain: z.string().min(1, "User domain is required"),
    competitor_domain: z.string().min(1, "Competitor domain is required"),
});

export const scheduleScanSchema = z.object({
    site_id: uuidSchema,
    url: urlSchema,
    email: emailSchema.optional().nullable(),
    delay_hours: z.number().int().min(1).optional().nullable(),
    delay_minutes: z.number().int().min(1).optional().nullable(),
    scan_type: z.enum(["full", "answers", "sov"]).optional(),
});

export const contactSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    email: emailSchema,
    message: z.string().min(1, "Message is required").max(1000),
    job_title: z.string().max(100).optional(),
});
