
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

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

interface CompletedWorkout {
  day: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<string>('');

  // Set today's day on component mount
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setTodayWorkout(today);
  }, []);

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
      toast.success(`Exercise added to ${selectedDay}`);
    }
  };

  const handleWorkoutCompleted = (day: string, date: string) => {
    setCompletedWorkouts(prev => [...prev, { day, date }]);
    // Store the completed workout in localStorage or database
    // This is a placeholder - in a real app you'd store this persistently
    toast.success(`${day}'s workout completed! 💪`);
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
