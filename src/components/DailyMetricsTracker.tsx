
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Droplet, Scale, Utensils } from 'lucide-react';

const metricsFormSchema = z.object({
  calories: z.coerce.number().min(0, { message: 'Calories cannot be negative' }).optional(),
  waterIntake: z.coerce.number().min(0, { message: 'Water intake cannot be negative' }).optional(),
  weight: z.coerce.number().min(0, { message: 'Weight cannot be negative' }).optional(),
});

type MetricsFormValues = z.infer<typeof metricsFormSchema>;

interface DailyMetricsProps {
  day: string;
  date?: string;
  onMetricsUpdated?: () => void;
}

const DailyMetricsTracker: React.FC<DailyMetricsProps> = ({ 
  day, 
  date = new Date().toISOString().split('T')[0],
  onMetricsUpdated 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [existingMetrics, setExistingMetrics] = React.useState<any>(null);
  
  const form = useForm<MetricsFormValues>({
    resolver: zodResolver(metricsFormSchema),
    defaultValues: {
      calories: undefined,
      waterIntake: undefined,
      weight: undefined,
    },
  });

  React.useEffect(() => {
    const fetchExistingMetrics = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('completed_workouts')
          .select('*')
          .eq('user_id', user.id)
          .eq('day', day)
          .eq('date', date)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setExistingMetrics(data);
          form.reset({
            calories: data.calories || undefined,
            waterIntake: data.water_intake || undefined,
            weight: data.weight || undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching existing metrics:', error);
      }
    };

    fetchExistingMetrics();
  }, [user, day, date, form]);

  const onSubmit = async (data: MetricsFormValues) => {
    if (!user) {
      toast.error('You must be logged in to track metrics');
      return;
    }

    setLoading(true);
    try {
      const metricsData = {
        calories: data.calories || null, 
        water_intake: data.waterIntake || null, 
        weight: data.weight || null,
      };
      
      let result;
      
      if (existingMetrics) {
        // Update existing record
        result = await supabase
          .from('completed_workouts')
          .update(metricsData)
          .eq('id', existingMetrics.id);
      } else {
        // Create new record
        result = await supabase
          .from('completed_workouts')
          .insert({
            user_id: user.id,
            day,
            date,
            ...metricsData
          });
      }
      
      if (result.error) throw result.error;
      
      toast.success('Daily metrics updated successfully');
      if (onMetricsUpdated) onMetricsUpdated();
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Failed to save your metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Daily Health Metrics</CardTitle>
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
                    <FormLabel className="flex items-center">
                      <Utensils className="h-4 w-4 mr-2" />
                      Calories
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 2000" 
                        {...field} 
                        value={field.value || ''}
                      />
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
                    <FormLabel className="flex items-center">
                      <Droplet className="h-4 w-4 mr-2" />
                      Water (ml)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 2000" 
                        {...field} 
                        value={field.value || ''}
                      />
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
                    <FormLabel className="flex items-center">
                      <Scale className="h-4 w-4 mr-2" />
                      Weight (kg)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 70.5" 
                        step="0.1"
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Daily Metrics'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DailyMetricsTracker;
