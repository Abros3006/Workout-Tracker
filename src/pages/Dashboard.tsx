
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CalendarCheck, CheckCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import ExerciseForm from '@/components/ExerciseForm';
import WeeklySchedule from '@/components/WeeklySchedule';
import ExerciseList from '@/components/ExerciseList';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

interface CompletedWorkout {
  id: string;
  day: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<string>('');
  const [reloadExercises, setReloadExercises] = useState(0);

  // Set today's day on component mount and fetch completed workouts
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setTodayWorkout(today);
    
    const fetchCompletedWorkouts = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('completed_workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        setCompletedWorkouts(data || []);
      } catch (error) {
        console.error('Error fetching completed workouts:', error);
      }
    };

    fetchCompletedWorkouts();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleAddExercise = (day: string) => {
    setSelectedDay(day);
    setShowExerciseForm(true);
  };

  const handleExerciseFormClose = (saved: boolean = false) => {
    setShowExerciseForm(false);
    if (saved) {
      // Trigger a reload of exercises by updating the state
      setReloadExercises(prev => prev + 1);
      toast.success(`Exercise added to ${selectedDay}`);
    }
  };

  const handleWorkoutCompleted = async (day: string, date: string) => {
    try {
      const { error } = await supabase
        .from('completed_workouts')
        .insert({
          user_id: user.id,
          day,
          date
        });
        
      if (error) throw error;
      
      // Update completed workouts list without a full reload
      const newCompletedWorkout = {
        id: Date.now().toString(), // Temporary ID until we refresh
        day,
        date
      };
      
      setCompletedWorkouts(prev => [newCompletedWorkout, ...prev]);
      toast.success(`${day}'s workout completed! 💪`);
    } catch (error) {
      console.error('Error saving completed workout:', error);
      toast.error('Failed to save workout completion');
    }
  };

  return (
    <PageTransition>
      <div className="container max-w-6xl mx-auto px-4 py-20 md:py-24">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Workout Dashboard</h1>
            <Link to="/progress" className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto">
                <CheckCircle className="mr-2 h-5 w-5" /> View Progress
              </Button>
            </Link>
          </div>

          {/* Today's Workout Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <CalendarCheck className="mr-2 h-5 w-5" />
                Today's Workout ({todayWorkout})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseList 
                key={`today-${reloadExercises}`}
                day={todayWorkout} 
                onWorkoutCompleted={handleWorkoutCompleted}
                showCompletionButton={true}
              />
            </CardContent>
          </Card>

          {/* Weekly Schedule Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Your Weekly Workout Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklySchedule 
                key={`schedule-${reloadExercises}`}
                days={daysOfWeek} 
                onAddExercise={handleAddExercise}
                currentDay={todayWorkout} 
              />
            </CardContent>
          </Card>
        </div>

        {showExerciseForm && (
          <ExerciseForm 
            day={selectedDay} 
            onClose={handleExerciseFormClose} 
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Dashboard;
