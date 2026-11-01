# AIRWRITE AI — Touchless AI Whiteboard & Productivity Platform

> **Write in the air. Think with AI. Create without limits.**

AIRWRITE AI is an education-first, touchless digital whiteboard designed for students, educators, and STEM researchers. It leverages computer vision (MediaPipe Tasks Vision) to transform standard webcam video into a zero-latency air stylus, coupled with Google Gemini 2.5 AI for handwriting OCR, step-by-step math/physics derivations, and interactive tutoring.

---

## Architecture Overview

```
                                      ┌────────────────────────────────────────┐
                                      │              Browser UI                │
                                      │   (React 19 + TypeScript + Vite)       │
                                      └───────────────────┬────────────────────┘
                                                          │
                   ┌──────────────────────────────────────┼──────────────────────────────────────┐
                   │                                      │                                      │
                   ▼                                      ▼                                      ▼
         ┌───────────────────┐                  ┌───────────────────┐                  ┌───────────────────┐
         │ Touchless Vision  │                  │   HTML5 Canvas    │                  │  AI STEM Engine   │
         │   (MediaPipe)     │                  │  Rendering Engine │                  │ (Gemini 2.5 API)  │
         │                   │                  │                   │                  │                   │
         │ • HandLandmarker  │                  │ • Hi-DPI scaling  │                  │ • Server proxy    │
         │ • 21-node skeleton│                  │ • Bezier curves   │                  │ • Handwriting OCR │
         │ • EMA smoothing   │                  │ • Tool palette    │                  │ • Step-by-step    │
         │ • Gesture engine  │                  │ • Multi-page SVG  │                  │ • STEM Tutor Chat │
         └───────────────────┘                  └───────────────────┘                  └───────────────────┘
```

### Module Structure

- **`src/core/stateMachine.ts`**: Centralized state machine managing transitions across 6 interaction states: `IDLE`, `TRACKING`, `WRITING`, `SELECTING`, `PAUSED`, and `PRESENTATION`.
- **`src/core/oneEuroFilter.ts`**: 1€ Filter (One Euro Filter) implementation for adaptive speed-based jitter suppression and low latency.
- **`src/core/gestureEngine.ts`**: Centralized gesture classification system (7 gestures), pen-down/pen-up hysteresis, interpolation, and configurable bindings.
- **`src/core/engine.test.ts`**: Comprehensive unit tests covering One Euro Filter, state machine transitions, hysteresis, and gesture classification.
- **`src/components/whiteboard/WhiteboardCanvas.tsx`**: Layered HTML5 Canvas separating completed strokes (base layer) from the active stroke and air cursor (overlay layer).
- **`src/types/index.ts`**: Complete TypeScript definitions for vectors, strokes, interaction states, gestures, and settings.
- **`src/services/handTrackingService.ts`**: MediaPipe HandLandmarker lifecycle bridge and camera stream capture.
- **`src/services/geminiService.ts`**: Client interface for whiteboard handwriting analysis and Gemini 3.8 Flash tutoring.
- **`server.ts`**: Express backend providing server-side `/api/gemini/analyze` and `/api/gemini/chat` endpoints.

---

## 7 Core Touchless Gestures

| Gesture | Finger Formation | Default Action in AIRWRITE AI | Configurable |
| :--- | :--- | :--- | :--- |
| **Pinch** | Index finger & thumb touching ($<0.05$ threshold) | **Draw Stroke**: Deliberate pen-down with hysteresis | Yes |
| **Index Extended** | Single index finger extended | **Aim / Hover**: Moves air pointer cursor without writing | Yes |
| **Open Palm** | All 5 fingers extended outward | **Pause / Pan**: Freezes drawing to prevent stray marks | Yes |
| **Closed Fist** | All fingers curled inward | **Presentation Laser**: Glowing laser trail on smartboards | Yes |
| **Swipe Left** | Rapid horizontal flick of hand to the left | **Previous Page / Undo**: Turns page back | Yes |
| **Swipe Right** | Rapid horizontal flick of hand to the right | **Next Page / Redo**: Advances page forward | Yes |
| **Two-Hand Zoom** | Distance delta between wrists of 2 detected hands | **Canvas Zoom**: Spreading zooms in, pinching zooms out | Yes |

---

## State Machine Architecture

```
                  ┌───────────────┐
                  │     IDLE      │
                  └───┬───────▲───┘
       HAND_DETECTED  │       │  HAND_LOST
                      ▼       │
        ┌─────────────┴───────┴─────────────┐
        │             TRACKING              │◄─────────┐
        └──┬──────────┬──────────┬────────┬─┘          │
  PEN_DOWN │  PEN_UP  │          │        │            │
           ▼          │          ▼        ▼            │
     ┌───────────┐    │     ┌────────┐ ┌──────────────┐│
     │  WRITING  │────┘     │ PAUSED │ │ PRESENTATION │┘
     └───────────┘          └────────┘ └──────────────┘
```

---

## Setup & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Gemini AI)
Create or edit `.env`:
```bash
GEMINI_API_KEY="your_google_gemini_api_key"
```
*(If no key is configured, AIRWRITE AI gracefully uses high-fidelity offline educational fallbacks so all features remain functional for testing).*

### 3. Run Unit Tests
```bash
npm test
# Runs node:test via tsx against src/utils/rules.test.ts
```

### 4. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

---

## Dependencies & Status

- **Installed & Active**:
  - `react`: `^19.0.1`
  - `react-dom`: `^19.0.1`
  - `@mediapipe/tasks-vision`: `^0.10.22` (MediaPipe Tasks Vision for hand landmark tracking)
  - `@google/genai`: `^2.4.0` (Google Gemini SDK)
  - `express`: `^4.21.2`
  - `tailwindcss`: `^4.3.3` (Tailwind CSS v4 with `@custom-variant dark`)
  - `lucide-react`: `^0.546.0`
  - `motion`: `^12.23.24`
  - `tsx`: `^4.21.0`
- **Outstanding Integrations for Future Phases**:
  - Optional Firebase Auth & Cloud Firestore if cross-device user sync is enabled via `set_up_firebase`.
