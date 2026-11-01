/**
 * Real MediaPipe Tasks Vision Hand Tracking Service for AIRWRITE AI
 * Integrates camera stream, MediaPipe HandLandmarker, and centralized GestureEngine.
 */

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { HandTrackingState, HandLandmark, UserSettings, Point2D } from '../types';
import { GestureEngine, GestureEngineResult } from '../core/gestureEngine';

export type HandTrackingCallback = (state: HandTrackingState, result?: GestureEngineResult) => void;

class HandTrackingService {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private lastVideoTime = -1;
  private isInitializing = false;
  private callbacks: Set<HandTrackingCallback> = new Set();
  private lastFpsCalcTime = performance.now();
  private frameCount = 0;
  private currentFps = 0;

  // Centralized Gesture Engine
  public engine: GestureEngine = new GestureEngine();

  public state: HandTrackingState = {
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    isModelLoaded: false,
    isTrackingActive: false,
    cameraStatus: 'idle',
    detectedHand: 'None',
    confidence: 0,
    gesture: 'none',
    interactionState: 'IDLE',
    rawPoint: null,
    smoothedPoint: null,
    pinchDistance: 1,
    isPinching: false,
    fps: 0,
    dominantHand: 'Right',
  };

  public subscribe(cb: HandTrackingCallback): () => void {
    this.callbacks.add(cb);
    cb(this.state);
    return () => this.callbacks.delete(cb);
  }

  private notify(result?: GestureEngineResult) {
    this.callbacks.forEach((cb) => cb({ ...this.state }, result));
  }

  /**
   * Initializes MediaPipe HandLandmarker from WASM bundle
   */
  public async loadModel(): Promise<boolean> {
    if (this.handLandmarker) return true;
    if (this.isInitializing) return false;

    try {
      this.isInitializing = true;
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2, // Support two hands for two-hand zoom
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.state.isModelLoaded = true;
      this.isInitializing = false;
      this.notify();
      return true;
    } catch (err: any) {
      console.warn('GPU delegate failed or CDN fetch issue, attempting CPU fallback:', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        this.state.isModelLoaded = true;
        this.isInitializing = false;
        this.notify();
        return true;
      } catch (cpuErr: any) {
        console.error('Failed to load MediaPipe HandLandmarker:', cpuErr);
        this.isInitializing = false;
        this.state.isModelLoaded = false;
        this.state.errorMessage = cpuErr.message || 'Failed to initialize vision models';
        this.notify();
        return false;
      }
    }
  }

  /**
   * Starts camera capture and hand detection loop
   */
  public async startTracking(
    videoEl: HTMLVideoElement,
    settings: UserSettings,
    canvasDimensions: { width: number; height: number }
  ): Promise<boolean> {
    this.videoElement = videoEl;
    this.state.dominantHand = settings.dominantHand;
    this.engine.updateFilterParams(settings.oneEuroMinCutoff, settings.oneEuroBeta);

    // 1. Ensure model is loaded
    if (!this.handLandmarker) {
      const loaded = await this.loadModel();
      if (!loaded) return false;
    }

    // 2. Request user media
    try {
      this.state.cameraStatus = 'requesting';
      this.notify();

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: settings.cameraResolution === '1080p' ? 1920 : 1280 },
          height: { ideal: settings.cameraResolution === '1080p' ? 1080 : 720 },
          facingMode: 'user',
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = this.stream;
      await videoEl.play();

      this.state.cameraStatus = 'active';
      this.state.isTrackingActive = true;
      this.notify();

      this.startDetectionLoop(settings, canvasDimensions);
      return true;
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      this.state.cameraStatus = err.name === 'NotAllowedError' ? 'denied' : 'error';
      this.state.errorMessage =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Enable camera access in browser to write in the air.'
          : err.message || 'Unable to open camera feed.';
      this.state.isTrackingActive = false;
      this.notify();
      return false;
    }
  }

  /**
   * Continuous detection frame loop
   */
  private startDetectionLoop(
    settings: UserSettings,
    canvasDimensions: { width: number; height: number }
  ) {
    const loop = () => {
      if (!this.state.isTrackingActive || !this.videoElement || !this.handLandmarker) {
        return;
      }

      const video = this.videoElement;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (video.currentTime !== this.lastVideoTime) {
          this.lastVideoTime = video.currentTime;
          const startTimeMs = performance.now();

          // Update FPS calculation
          this.frameCount++;
          if (startTimeMs - this.lastFpsCalcTime >= 1000) {
            this.currentFps = Math.round((this.frameCount * 1000) / (startTimeMs - this.lastFpsCalcTime));
            this.frameCount = 0;
            this.lastFpsCalcTime = startTimeMs;
          }

          try {
            const results = this.handLandmarker.detectForVideo(video, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
              const handedness = results.handednesses?.[0]?.[0]?.categoryName || 'Right';
              const confidence = results.handednesses?.[0]?.[0]?.score || 0.9;

              // Process frame through centralized GestureEngine
              const engineResult = this.engine.processFrame(
                results.landmarks as HandLandmark[][],
                canvasDimensions.width,
                canvasDimensions.height,
                settings,
                startTimeMs
              );

              this.state = {
                ...this.state,
                detectedHand: handedness as 'Left' | 'Right',
                confidence: Math.round(confidence * 100),
                gesture: engineResult.gesture,
                interactionState: engineResult.interactionState,
                rawPoint: engineResult.rawPoint,
                smoothedPoint: engineResult.smoothedPoint,
                pinchDistance: engineResult.pinchDistance,
                isPinching: engineResult.isPinching,
                zoomScaleDelta: engineResult.zoomScaleDelta,
                fps: this.currentFps,
              };

              this.notify(engineResult);
            } else {
              // No hand detected in frame - engine handles clean stroke termination and transitions to IDLE
              const engineResult = this.engine.processFrame(
                [],
                canvasDimensions.width,
                canvasDimensions.height,
                settings,
                startTimeMs
              );

              this.state = {
                ...this.state,
                detectedHand: 'None',
                confidence: 0,
                gesture: 'none',
                interactionState: 'IDLE',
                rawPoint: null,
                smoothedPoint: null,
                pinchDistance: 1,
                isPinching: false,
                fps: this.currentFps,
              };

              this.notify(engineResult);
            }
          } catch (detErr) {
            console.error('Detection frame error:', detErr);
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stops video stream and detection loop
   */
  public stopTracking() {
    this.state.isTrackingActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.state.cameraStatus = 'idle';
    this.state.interactionState = 'IDLE';
    this.engine.reset();
    this.notify();
  }

  /**
   * For simulated gestures during testing, presentations, or devices without camera
   */
  public simulateGesture(
    point: Point2D | null,
    gesture: HandTrackingState['gesture'],
    isPinching = false
  ) {
    let interactionState: HandTrackingState['interactionState'] = 'TRACKING';
    if (isPinching || gesture === 'pinch') {
      interactionState = 'WRITING';
    } else if (gesture === 'open_palm') {
      interactionState = 'PAUSED';
    } else if (gesture === 'closed_fist') {
      interactionState = 'PRESENTATION';
    } else if (!point) {
      interactionState = 'IDLE';
    }

    this.state = {
      ...this.state,
      detectedHand: 'Right',
      confidence: 99,
      gesture,
      interactionState,
      rawPoint: point,
      smoothedPoint: point,
      pinchDistance: isPinching ? 0.02 : 0.08,
      isPinching,
      fps: 60,
    };

    const simEngineResult: GestureEngineResult = {
      gesture,
      mappedAction: isPinching ? 'draw' : gesture === 'open_palm' ? 'pause' : 'aim_hover',
      interactionState,
      rawPoint: point,
      smoothedPoint: point,
      interpolatedPoints: point ? [point] : [],
      pinchDistance: isPinching ? 0.02 : 0.08,
      isPinching,
      isPenDown: isPinching,
      strokeStarted: isPinching,
      strokeTerminated: !isPinching,
    };

    this.notify(simEngineResult);
  }
}

export const handTracker = new HandTrackingService();
