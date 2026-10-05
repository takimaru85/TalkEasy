import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { LearningSubjectKey } from '@/learning/types';

/** Screens inside Parent Mode (only reachable after the PIN). */
export type ParentStackParamList = {
  Dashboard: undefined;
  ChildProfile: undefined;
  ManageRewards: undefined;
  ManageButtons: undefined;
  EditButton: { buttonId?: number; categoryId?: number; practice?: boolean };
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
  CareNotes: { filter?: import('@/types/models').NoteType } | undefined;
  EditNote: { noteId?: number; noteType?: import('@/types/models').NoteType };
  Progress: undefined;
  PracticeOverview: undefined;
  Settings: undefined;
  ManageLessons: undefined;
  EditLesson: { lessonId?: number };
  AdaptiveProgress: undefined;
  WeeklyProgress: undefined;
  SpeechPracticeSettings: undefined;
  VoicePracticeSummary: undefined;
  PronunciationTest: undefined;
  Subscription: undefined;
  TherapySettings: undefined;
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
  SpeechPractice: undefined;
  MyProgress: undefined;
  AdventureMap: undefined;
  SpacePet: undefined;
  Achievements: undefined;
  RewardsShop: undefined;
  SpeechActivity: { activityId: string; category?: string };
  SpeechStage: { stageId: string };
  SoundTarget: { targetId: string };
  VoiceComm: undefined;
  VoiceArea: { category: string };
  VoiceActivity: { activityId: string; limit?: number; sessionStep?: number };
  PracticeSession: { completed?: number } | undefined;
  /**
   * Therapy home practice, under Activities. Child-side routes, because the child does the
   * practice — but every plan-changing and goal-changing control stays in Parent Mode.
   */
  /**
   * Scan Assignment, under School Mode. `ScanReview` is told how the flow starts so the screen can
   * open the camera, the library or an empty editor without a second entry point for each.
   */
  ScanAssignment: undefined;
  ScanReview: { source: 'camera' | 'library' | 'manual' };
  TherapyHome: undefined;
  TherapyDay: undefined;
  TherapyLibrary: undefined;
  TherapyActivity: { activityId: string };
  TherapyGoals: undefined;
  ChooseAdventure: undefined;
  Collection: undefined;
  ParentPin: undefined;
  Parent: NavigatorScreenParams<ParentStackParamList>;
  /**
   * TalkEasy Plus. On the ROOT stack, not inside Parent Mode, because a child reaches it by tapping
   * a locked activity and must not need a PIN just to be told what the lock is. Nothing on it can
   * change a plan or spend money — that lives behind the PIN in Parent → Subscription.
   */
  Plus: undefined;
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
