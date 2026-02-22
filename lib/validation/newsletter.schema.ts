import { z } from "zod";

export const subscribeSchema = z.object({
	email: z.string().email("Valid email is required"),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
