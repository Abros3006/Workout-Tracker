
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const metricsFormSchema = z.object({
  calories: z.coerce.number().min(0, { message: 'Calories cannot be negative' }).optional(),
  waterIntake: z.coerce.number().min(0, { message: 'Water intake cannot be negative' }).optional(),
  weight: z.coerce.number().min(0, { message: 'Weight cannot be negative' }).optional(),
});

type MetricsFormValues = z.infer<typeof metricsFormSchema>;

interface DailyMetricsFormProps {
  day: string;
  onMetricsUpdated: () => void;
}

const DailyMetricsForm: React.FC<DailyMetricsFormProps> = ({ day, onMetricsUpdated }) => {
  const { user } = useAuth();
  const form = useForm<MetricsFormValues>({
    resolver: zodResolver(metricsFormSchema),
    defaultValues: {
      calories: undefined,
      waterIntake: undefined,
      weight: undefined,
    },
  });

  const onSubmit = async (data: MetricsFormValues) => {
    if (!user) {
      toast.error('You must be logged in to track metrics');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Check if there's already a completed workout for today
      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('completed_workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('day', day);
        
      if (fetchError) throw fetchError;
      
      if (existingWorkouts && existingWorkouts.length > 0) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('completed_workouts')
          .update({
            calories: data.calories || existingWorkouts[0].calories,
            water_intake: data.waterIntake || existingWorkouts[0].water_intake,
            weight: data.weight || existingWorkouts[0].weight,
          })
          .eq('id', existingWorkouts[0].id);
          
        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: createError } = await supabase
          .from('completed_workouts')
          .insert({
            user_id: user.id,
            day,
            date: today,
            calories: data.calories,
            water_intake: data.waterIntake,
            weight: data.weight,
          });
          
        if (createError) throw createError;
      }
      
      toast.success('Daily metrics updated successfully');
      form.reset({
        calories: undefined,
        waterIntake: undefined,
        weight: undefined,
      });
      onMetricsUpdated();
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Failed to save metrics. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Track Today's Health Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waterIntake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Intake (ml)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000" {...field} value={field.value || ''} />
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
                      <Input type="number" placeholder="e.g., 70" step="0.1" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">Update Metrics</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DailyMetricsForm;
