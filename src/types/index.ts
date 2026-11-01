/**
 * Core TypeScript definitions for AIRWRITE AI
 * Touchless education-first whiteboard & productivity platform
 */

export * from './ai';

export type AppView = 'dashboard' | 'workspace' | 'projects' | 'settings' | 'ai-tutor';

export type DrawingTool = 
  | 'select'
  | 'pan'
  | 'pen' 
  | 'highlighter' 
  | 'eraser' 
  | 'line' 
  | 'arrow' 
  | 'rect' 
  | 'circle' 
  | 'text' 
  | 'laser';

export interface Point2D {
  x: number;
  y: number;
  pressure?: number;
  time?: number;
}

export interface DrawingStroke {
  id: string;
  tool: DrawingTool;
  color: string;
  size: number;
  width?: number; // Preserved stroke width
  opacity: number;
  points: Point2D[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  createdAt: number;
}

export type BackgroundStyle = 'blank' | 'grid' | 'ruled' | 'dots' | 'blueprint';

export interface WhiteboardPage {
  id: string;
  title: string;
  strokes: DrawingStroke[];
  background: BackgroundStyle;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  subject: 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'Computer Science' | 'General';
  template: 'blank' | 'cornell' | 'math_grid' | 'lab_report' | 'concept_map';
  pages: WhiteboardPage[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isStarred: boolean;
  thumbnail?: string;
}

export type InteractionState = 
  | 'IDLE' 
  | 'TRACKING' 
  | 'WRITING' 
  | 'SELECTING' 
  | 'PAUSED' 
  | 'PRESENTATION';

export type HandGesture = 
  | 'none' 
  | 'pointing'        // Index finger extended -> Cursor positioning / air hover
  | 'pinch'           // Thumb and index pinch together -> Draw stroke
  | 'open_palm'       // 5 fingers extended -> Pause / pan canvas
  | 'closed_fist'     // Closed fist -> Presentation laser / clear hold
  | 'swipe_left'      // Quick leftward flick -> Previous page / undo
  | 'swipe_right'     // Quick rightward flick -> Next page / redo
  | 'two_hand_zoom';  // Two hands distance delta -> Zoom canvas

export type GestureAction = 
  | 'draw' 
  | 'aim_hover' 
  | 'pause' 
  | 'laser_presentation' 
  | 'erase_select' 
  | 'prev_page' 
  | 'next_page' 
  | 'undo' 
  | 'clear_board'
  | 'zoom';

export interface GestureBindingConfig {
  pinchAction: GestureAction;
  pointingAction: GestureAction;
  openPalmAction: GestureAction;
  closedFistAction: GestureAction;
  swipeLeftAction: GestureAction;
  swipeRightAction: GestureAction;
  twoHandZoomAction: GestureAction;
  swipeVelocityThreshold: number; // normalized units per second
  cooldownMs: number;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingState {
  isSupported: boolean;
  isModelLoaded: boolean;
  isTrackingActive: boolean;
  cameraStatus: 'idle' | 'requesting' | 'active' | 'denied' | 'error';
  errorMessage?: string;
  detectedHand: 'Left' | 'Right' | 'None';
  confidence: number;
  gesture: HandGesture;
  interactionState: InteractionState;
  rawPoint: Point2D | null;
  smoothedPoint: Point2D | null;
  pinchDistance: number;
  isPinching: boolean;
  zoomScaleDelta?: number;
  fps: number;
  dominantHand: 'Left' | 'Right';
}

export interface UserSettings {
  dominantHand: 'Right' | 'Left';
  pinchSensitivity: number; // 0.01 to 0.10 (normalized distance threshold)
  smoothingFactor: number;   // 0.1 (very smooth, slightly laggy) to 0.8 (responsive, raw)
  oneEuroMinCutoff: number;  // 1€ Filter min cutoff frequency in Hz (e.g. 1.0)
  oneEuroBeta: number;       // 1€ Filter velocity coefficient (e.g. 0.007)
  mirrorWebcam: boolean;
  showLandmarks: boolean;
  showWebcamHUD: boolean;
  cameraResolution: '720p' | '1080p' | '480p';
  academicLevel: 'High School' | 'Undergraduate' | 'Advanced AP/College';
  hapticFeedback: boolean;
  autoSaveInterval: number; // in seconds
  gestureBindings: GestureBindingConfig;
}

export interface AIAnalysisStep {
  stepNumber: number;
  title: string;
  detail: string;
}

export interface AIAnalysisResult {
  success: boolean;
  isSimulated?: boolean;
  source?: string;
  transcription: string;
  subject: string;
  stepByStepSolution: AIAnalysisStep[];
  conceptSummary: string;
  practiceQuestion?: string;
  practiceAnswer?: string;
  error?: string;
}

export interface AITutorChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: number;
  isSimulated?: boolean;
}

export interface LearningActivityStats {
  streakDays: number;
  weeklyMinutes: number;
  gesturesMasteredCount: number;
  problemsSolvedCount: number;
  notesCreatedCount: number;
  dailyGoalPercentage: number;
}
