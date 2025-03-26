
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('schedule');
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
  };

  return (
    <PageTransition>
      <div className="container max-w-6xl mx-auto px-4 py-20 md:py-24">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Workout Dashboard</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                <TabsTrigger value="progress">My Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Your Weekly Workout Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <Card className="bg-muted/30">
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
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <WeeklySchedule 
                      days={daysOfWeek} 
                      onAddExercise={handleAddExercise} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {completedWorkouts.length === 0 ? (
                      <p className="text-muted-foreground">You haven't completed any workouts yet. Keep going!</p>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Completed Workouts</h3>
                        <div className="space-y-2">
                          {completedWorkouts.map((workout, index) => (
                            <div 
                              key={index} 
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
              </TabsContent>
            </Tabs>
          </div>
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
