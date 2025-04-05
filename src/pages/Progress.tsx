
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { CheckCircle, Droplet, Scale, Utensils } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompletedWorkout {
  id: string;
  day: string;
  date: string;
  calories?: number | null;
  water_intake?: number | null;
  weight?: number | null;
}

const ProgressPage = () => {
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

  // Calculate averages for metrics
  const weeklyWorkouts = completedWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    return workoutDate >= oneWeekAgo && workoutDate <= today;
  });

  const avgCalories = weeklyWorkouts
    .filter(w => w.calories !== null && w.calories !== undefined)
    .reduce((acc, workout) => acc + (workout.calories || 0), 0) / 
    (weeklyWorkouts.filter(w => w.calories !== null && w.calories !== undefined).length || 1);

  const avgWater = weeklyWorkouts
    .filter(w => w.water_intake !== null && w.water_intake !== undefined)
    .reduce((acc, workout) => acc + (workout.water_intake || 0), 0) / 
    (weeklyWorkouts.filter(w => w.water_intake !== null && w.water_intake !== undefined).length || 1);

  const lastWeight = weeklyWorkouts
    .filter(w => w.weight !== null && w.weight !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weight;

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
              <CardTitle className="text-xl">Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2">
                    <Utensils className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Average Daily Calories</h3>
                  </div>
                  <p className="text-2xl font-bold">{Math.round(avgCalories) || '-'}</p>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2">
                    <Droplet className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium">Average Water Intake</h3>
                  </div>
                  <p className="text-2xl font-bold">{Math.round(avgWater) || '-'} ml</p>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2">
                    <Scale className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-medium">Latest Weight</h3>
                  </div>
                  <p className="text-2xl font-bold">{lastWeight?.toFixed(1) || '-'} kg</p>
                  <p className="text-sm text-muted-foreground">Most recent entry</p>
                </div>
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
                        className="p-4 border rounded-md"
                      >
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <p className="font-medium">{workout.day}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(workout.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {(workout.calories || workout.water_intake || workout.weight) && (
                          <div className="mt-3 pl-8 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            {workout.calories && (
                              <div className="flex items-center">
                                <Utensils className="h-4 w-4 text-muted-foreground mr-1" />
                                <span>{workout.calories} calories</span>
                              </div>
                            )}
                            
                            {workout.water_intake && (
                              <div className="flex items-center">
                                <Droplet className="h-4 w-4 text-blue-500 mr-1" />
                                <span>{workout.water_intake} ml water</span>
                              </div>
                            )}
                            
                            {workout.weight && (
                              <div className="flex items-center">
                                <Scale className="h-4 w-4 text-green-500 mr-1" />
                                <span>{workout.weight} kg</span>
                              </div>
                            )}
                          </div>
                        )}
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

export default ProgressPage;
