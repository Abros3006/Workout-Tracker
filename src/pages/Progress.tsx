
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface CompletedWorkout {
  day: string;
  date: string;
}

// For demo purposes, we'll have some sample completed workouts
// In a real app, you would fetch this from a database
const sampleCompletedWorkouts: CompletedWorkout[] = [
  { day: 'Monday', date: new Date().toISOString().split('T')[0] },
  { day: 'Wednesday', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

const Progress = () => {
  const { user } = useAuth();
  const [completedWorkouts] = useState<CompletedWorkout[]>(sampleCompletedWorkouts);

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
              <CardTitle className="text-2xl">Completed Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {completedWorkouts.length === 0 ? (
                <p className="text-muted-foreground">You haven't completed any workouts yet. Keep going!</p>
              ) : (
                <div className="space-y-4">
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
        </div>
      </div>
    </PageTransition>
  );
};

export default Progress;
