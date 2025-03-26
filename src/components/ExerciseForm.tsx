
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Exercise name must be at least 2 characters' }),
  sets: z.coerce.number().min(1, { message: 'Must have at least 1 set' }),
  reps: z.coerce.number().min(1, { message: 'Must have at least 1 rep' }),
  weight: z.coerce.number().min(0, { message: 'Weight cannot be negative' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExerciseFormProps {
  day: string;
  onClose: (saved?: boolean) => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ day, onClose }) => {
  const { user } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      notes: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to add exercises');
      return;
    }

    try {
      // First, check if a workout for this day already exists
      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .eq('day', day)
        .limit(1);

      if (fetchError) throw fetchError;

      let workoutId;

      // If no workout exists for this day, create one
      if (!existingWorkouts || existingWorkouts.length === 0) {
        const { data: newWorkout, error: createError } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            day: day,
          })
          .select()
          .single();

        if (createError) throw createError;
        workoutId = newWorkout.id;
      } else {
        workoutId = existingWorkouts[0].id;
      }

      // Now add the exercise to the workout
      const { error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workoutId,
          name: data.name,
          sets: data.sets,
          reps: data.reps,
          weight: data.weight
        });

      if (exerciseError) throw exerciseError;

      toast.success(`Added ${data.name} to ${day}'s workout`);
      onClose(true);
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Failed to save exercise. Please try again.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Exercise for {day}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bench Press" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sets</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reps</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any special instructions or notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit">Save Exercise</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseForm;
