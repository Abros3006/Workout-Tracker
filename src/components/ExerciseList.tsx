
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
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
  onWorkoutCompleted?: (day: string, date: string) => void;
  showCompletionButton?: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  day, 
  onWorkoutCompleted,
  showCompletionButton = false
}) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allCompleted, setAllCompleted] = useState(false);
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

  const toggleExerciseCompleted = (id: string) => {
    setExercises(prevExercises => {
      const newExercises = prevExercises.map(ex => 
        ex.id === id ? { ...ex, completed: !ex.completed } : ex
      );
      
      // Check if all exercises are completed
      const areAllCompleted = newExercises.length > 0 && newExercises.every(ex => ex.completed);
      setAllCompleted(areAllCompleted);
      
      return newExercises;
    });
  };

  const markWorkoutCompleted = async () => {
    if (!user) {
      toast.error('You must be logged in to track workouts');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Insert the completed workout
      const { error } = await supabase
        .from('completed_workouts')
        .insert({
          user_id: user.id,
          day,
          date: today
        });
        
      if (error) throw error;

      if (onWorkoutCompleted) {
        onWorkoutCompleted(day, today);
      }
      
      toast.success(`${day}'s workout completed! 💪`);
    } catch (error) {
      console.error('Error saving completed workout:', error);
      toast.error('Failed to save workout completion');
    }
  };

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
              {showCompletionButton && <TableHead className="w-[50px]">Done</TableHead>}
              <TableHead>Exercise</TableHead>
              <TableHead className="w-[80px] text-right">Sets</TableHead>
              <TableHead className="w-[80px] text-right">Reps</TableHead>
              <TableHead className="w-[80px] text-right">Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                {showCompletionButton && (
                  <TableCell>
                    <Checkbox 
                      checked={exercise.completed}
                      onCheckedChange={() => toggleExerciseCompleted(exercise.id)}
                      aria-label={`Mark ${exercise.name} as completed`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{exercise.name}</TableCell>
                <TableCell className="text-right">{exercise.sets}</TableCell>
                <TableCell className="text-right">{exercise.reps}</TableCell>
                <TableCell className="text-right">{exercise.weight} kg</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showCompletionButton && allCompleted && exercises.length > 0 && (
        <Button 
          onClick={markWorkoutCompleted}
          className="w-full"
          variant="default"
        >
          <CheckCircle className="mr-2 h-4 w-4" /> Mark Workout Complete
        </Button>
      )}
    </div>
  );
};

export default ExerciseList;
