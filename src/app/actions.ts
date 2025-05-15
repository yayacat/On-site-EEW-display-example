// use server
'use server';

import { z } from 'zod';
import { estimateAttendance, type EstimateAttendanceOutput } from '@/ai/flows/estimate-attendance';

const EstimateFormSchema = z.object({
  eventDescription: z.string().min(10, { message: 'Event description must be at least 10 characters long.' }),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  data?: EstimateAttendanceOutput & { estimatedAt: string };
};

export async function handleEstimateAttendance(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const eventDescription = formData.get('eventDescription');

  const validatedFields = EstimateFormSchema.safeParse({
    eventDescription,
  });

  if (!validatedFields.success) {
    const issues = validatedFields.error.issues.map((issue) => issue.message);
    return {
      message: 'Validation failed.',
      issues,
      fields: {
        eventDescription: eventDescription as string,
      },
    };
  }

  try {
    const result = await estimateAttendance({ eventDescription: validatedFields.data.eventDescription });
    const estimatedAt = new Date().toLocaleString();
    return {
      message: 'Attendance estimated successfully.',
      data: { ...result, estimatedAt },
    };
  } catch (error) {
    console.error('Error estimating attendance:', error);
    return {
      message: 'Failed to estimate attendance. Please try again.',
      fields: {
        eventDescription: validatedFields.data.eventDescription,
      },
    };
  }
}
