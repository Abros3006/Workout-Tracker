
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  completed?: boolean;
}

interface ExerciseListProps {
  day: string;
}

const Exercises: React.FC<ExerciseListProps> = ({ 
  day, 
}) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // First, get the workout ID for this day
        const { data: workouts, error: workoutError } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', user.id)
          .eq('day', day);

        if (workoutError) throw workoutError;

        // If no workout found for this day, return empty array
        if (!workouts || workouts.length === 0) {
          setExercises([]);
          setIsLoading(false);
          return;
        }

        // Get all exercises for this workout
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', workouts[0].id);
          
        if (exercisesError) throw exercisesError;

        // Initialize all exercises as not completed
        const formattedExercises = exercisesData ? exercisesData.map(ex => ({
          ...ex,
          completed: false
        })) : [];

        setExercises(formattedExercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast.error('Failed to load exercises');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [user, day]);


  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading exercises...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No exercises added for {day} yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exercise</TableHead>
              <TableHead className="w-[80px] text-right">Sets</TableHead>
              <TableHead className="w-[80px] text-right">Reps</TableHead>
              <TableHead className="w-[80px] text-right">Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell className="font-medium">{exercise.name}</TableCell>
                <TableCell className="text-right">{exercise.sets}</TableCell>
                <TableCell className="text-right">{exercise.reps}</TableCell>
                <TableCell className="text-right">{exercise.weight} kg</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Exercises;
