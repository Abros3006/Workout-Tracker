
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CheckCircle, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

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
  // This would typically come from a database or state management
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allCompleted, setAllCompleted] = useState(false);

  // Mock data for demonstration - would be replaced with actual data fetching
  useEffect(() => {
    // For testing purposes only - in a real app this would come from a database
    const mockExercises = day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? [
      { id: '1', name: 'Bench Press', sets: 3, reps: 12, weight: 70 },
      { id: '2', name: 'Squats', sets: 4, reps: 10, weight: 100 },
      { id: '3', name: 'Pull Ups', sets: 3, reps: 8, weight: 0 },
    ] : [];
    
    setExercises(mockExercises.map(ex => ({ ...ex, completed: false })));
  }, [day]);

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

  const markWorkoutCompleted = () => {
    if (onWorkoutCompleted) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      onWorkoutCompleted(day, today);
      toast.success(`${day}'s workout completed! 💪`);
    }
  };

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

      {showCompletionButton && allCompleted && (
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
