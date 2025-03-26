
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import ExerciseForm from '@/components/ExerciseForm';
import WeeklySchedule from '@/components/WeeklySchedule';
import { toast } from 'sonner';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');

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
            </Tabs>
          </div>

          <TabsContent value="schedule" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Your Weekly Workout Plan</CardTitle>
              </CardHeader>
              <CardContent>
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
                <p className="text-muted-foreground">Track your workout progress here. Coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
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
