
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface ExerciseListProps {
  day: string;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ day }) => {
  // This would typically come from a database or state management
  const [exercises, setExercises] = useState<Exercise[]>([]);

  if (exercises.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No exercises added for {day} yet.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exercise</TableHead>
            <TableHead className="w-[100px] text-right">Sets</TableHead>
            <TableHead className="w-[100px] text-right">Reps</TableHead>
            <TableHead className="w-[100px] text-right">Weight</TableHead>
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
  );
};

export default ExerciseList;
