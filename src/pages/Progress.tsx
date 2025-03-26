
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompletedWorkout {
  id: string;
  day: string;
  date: string;
}

const Progress = () => {
  const { user } = useAuth();
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate stats
  const totalWorkoutsThisWeek = completedWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    return workoutDate >= oneWeekAgo && workoutDate <= today;
  }).length;
  
  const progressPercentage = Math.min(Math.round((totalWorkoutsThisWeek / 7) * 100), 100);

  useEffect(() => {
    const fetchCompletedWorkouts = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('completed_workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setCompletedWorkouts(data || []);
      } catch (error) {
        console.error('Error fetching completed workouts:', error);
        toast.error('Failed to load your progress');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedWorkouts();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <PageTransition>
      <div className="container max-w-6xl mx-auto px-4 py-20 md:py-24">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold">Your Progress</h1>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Weekly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This week's workouts</span>
                  <span className="font-medium">{totalWorkoutsThisWeek}/7</span>
                </div>
                <ProgressBar value={progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {progressPercentage}% of your weekly goal completed
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Completed Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading your progress...</p>
                </div>
              ) : completedWorkouts.length === 0 ? (
                <p className="text-muted-foreground">You haven't completed any workouts yet. Keep going!</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {completedWorkouts.map((workout) => (
                      <div 
                        key={workout.id} 
                        className="p-3 border rounded-md flex items-center"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium">{workout.day}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Progress;
