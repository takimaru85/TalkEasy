import React from 'react';
import type { Exercise } from '@/speechpractice/types';
import { BuildExerciseView } from './BuildExerciseView';
import { ChooseExerciseView } from './ChooseExerciseView';
import { ClapExerciseView } from './ClapExerciseView';
import { SayExerciseView } from './SayExerciseView';
import { StoryExerciseView } from './StoryExerciseView';
import { TurnsExerciseView } from './TurnsExerciseView';
import type { PracticeKit } from './kit';

/** Renders any exercise. A new exercise kind = one view + one case here. */
export function ExerciseView({ exercise, kit }: { exercise: Exercise; kit: PracticeKit }) {
  switch (exercise.kind) {
    case 'say':
      return <SayExerciseView exercise={exercise} kit={kit} />;
    case 'choose':
      return <ChooseExerciseView exercise={exercise} kit={kit} />;
    case 'build':
      return <BuildExerciseView exercise={exercise} kit={kit} />;
    case 'story':
      return <StoryExerciseView exercise={exercise} kit={kit} />;
    case 'turns':
      return <TurnsExerciseView exercise={exercise} kit={kit} />;
    case 'clap':
      return <ClapExerciseView exercise={exercise} kit={kit} />;
  }
}
