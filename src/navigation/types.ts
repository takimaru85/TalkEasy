import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { LearningSubjectKey } from '@/learning/types';

/** Screens inside Parent Mode (only reachable after the PIN). */
export type ParentStackParamList = {
  Dashboard: undefined;
  ChildProfile: undefined;
  ManageRewards: undefined;
  ManageButtons: undefined;
  EditButton: { buttonId?: number; categoryId?: number };
  ManageFavorites: undefined;
  ManageSubjects: undefined;
  EditSubject: { subjectId?: number };
  ManageAssignments: undefined;
  EditAssignment: { assignmentId?: number; subjectId?: number };
  ManageEvents: undefined;
  EditEvent: { eventId?: number; date?: string };
  ManageLearning: undefined;
  ManageRoutine: undefined;
  ManageTherapy: undefined;
  EditTherapy: { activityId?: number };
  CareNotes: undefined;
  EditNote: { noteId?: number };
  Progress: undefined;
  Settings: undefined;
  ManageLessons: undefined;
  EditLesson: { lessonId?: number };
  AdaptiveProgress: undefined;
};

/** Child mode is one stack: a Home grid plus one screen per section. */
export type RootStackParamList = {
  ChildHome: undefined;
  Communicate: undefined;
  Feelings: undefined;
  SchoolMode: undefined;
  School: undefined;
  SubjectDetail: { subjectId: number };
  Assignments: undefined;
  AssignmentDetail: { assignmentId: number };
  Calendar: undefined;
  Learn: undefined;
  LearnSubject: { subjectKey: LearningSubjectKey };
  LearnActivity: { activityKey: string };
  MyDay: undefined;
  Activities: undefined;
  Favorites: undefined;
  AdaptiveHome: undefined;
  AdaptiveSubjects: undefined;
  AdaptiveLesson: { lessonId: number };
  WritingPractice: undefined;
  WritingCanvas: { level: number };
  SpeakPractice: undefined;
  SoundPractice: undefined;
  SoundPracticeDetail: { soundId: string };
  ParentPin: undefined;
  Parent: NavigatorScreenParams<ParentStackParamList>;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type ParentScreenProps<T extends keyof ParentStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ParentStackParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
