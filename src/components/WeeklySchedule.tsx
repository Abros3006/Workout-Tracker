
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ExerciseList from '@/components/ExerciseList';

interface WeeklyScheduleProps {
  days: string[];
  onAddExercise: (day: string) => void;
  currentDay?: string;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ days, onAddExercise, currentDay }) => {
  const [openDays, setOpenDays] = useState<string[]>([days[0]]);

  const toggleDay = (day: string) => {
    setOpenDays(current => 
      current.includes(day) 
        ? current.filter(d => d !== day) 
        : [...current, day]
    );
  };

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <Collapsible 
          key={day} 
          open={openDays.includes(day)}
          onOpenChange={() => toggleDay(day)}
          className={`border rounded-lg shadow-sm ${day === currentDay ? 'border-primary' : ''}`}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
            <div className={`font-medium text-lg ${day === currentDay ? 'text-primary' : ''}`}>
              {day} {day === currentDay && "(Today)"}
            </div>
            <div className={`transform transition-transform ${openDays.includes(day) ? 'rotate-180' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0 border-t">
              <ExerciseList 
                day={day} 
                showCompletionButton={day === currentDay}
              />
              <Button 
                onClick={() => onAddExercise(day)} 
                className="w-full mt-4" 
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default WeeklySchedule;
