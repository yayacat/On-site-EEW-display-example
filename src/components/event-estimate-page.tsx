'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Lightbulb, CalendarClock, Users, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleEstimateAttendance, type FormState } from '@/app/actions';

const formSchema = z.object({
  eventDescription: z.string().min(10, {
    message: 'Event description must be at least 10 characters.',
  }),
});

type FormData = z.infer<typeof formSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Estimating...
        </>
      ) : (
        'Estimate Attendance'
      )}
    </Button>
  );
}

export default function EventEstimatePage() {
  const initialState: FormState | null = null;
  const [state, formAction] = useFormState(handleEstimateAttendance, initialState);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventDescription: state?.fields?.eventDescription || '',
    },
  });

  React.useEffect(() => {
    if (state?.fields?.eventDescription) {
      form.setValue('eventDescription', state.fields.eventDescription);
    }
    if (state?.message && !state.data && !state.issues) { // General error not related to validation
       // Optionally trigger a toast or an alert here if not using the Alert component below
    }
  }, [state, form]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Event Attendance Estimator</CardTitle>
          </div>
          <CardDescription className="text-md">
            Describe your event below, and our AI will provide an estimated attendance figure along with its reasoning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div>
              <Label htmlFor="eventDescription" className="text-lg font-semibold">Event Description</Label>
              <Textarea
                id="eventDescription"
                name="eventDescription"
                placeholder="e.g., A weekend workshop on Next.js for intermediate developers, held in downtown San Francisco, with free pizza and swag. Expected guest speaker from Vercel."
                className="mt-2 min-h-[150px] text-base"
                defaultValue={state?.fields?.eventDescription}
                aria-invalid={!!form.formState.errors.eventDescription || !!state?.issues?.some(issue => issue.toLowerCase().includes('description'))}
                aria-describedby="description-error"
              />
              {form.formState.errors.eventDescription && (
                 <p id="description-error" className="mt-1 text-sm text-destructive">{form.formState.errors.eventDescription.message}</p>
              )}
              {state?.issues?.map((issue, index) => (
                <p key={index} id="description-error" className="mt-1 text-sm text-destructive">{issue}</p>
              ))}
            </div>
            <SubmitButton />
          </form>

          {state?.message && !state.data && state.issues === undefined && (
             <Alert variant="destructive" className="mt-6">
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {state?.data && (
            <div className="mt-8 space-y-6">
              <Separator />
              <h3 className="text-2xl font-semibold text-primary">Estimation Results</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                  <CalendarClock className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated At</p>
                    <p className="text-lg font-semibold">{state.data.estimatedAt}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                  <Users className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Attendance</p>
                    <p className="text-3xl font-bold text-primary">{state.data.estimatedAttendance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">AI Reasoning</p>
                  <p className="text-base leading-relaxed">{state.data.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-4">
          <p className="text-xs text-muted-foreground">
            Note: AI estimations are based on the provided description and general patterns. Actual attendance may vary.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
