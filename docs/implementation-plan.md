# Implementation Guide for Monk Mode: Forge
**Target Agent**: Claude 3.5-based coding agent  
**Project**: Complete the React Native implementation of Monk Mode: Forge per the PRD  
**Date**: April 11, 2025  
**Goal**: Finalize MVP features within 6-9 weeks, focusing on missing functionality, UX fidelity, and analytics integration.

---

## 1. Overview
This guide outlines tasks to complete the "Monk Mode: Forge" React Native app, aligning with the Product Requirements Document (PRD). The app supports extreme focus through intention-setting, a task-linked timer, app-blocking, and brutal feedback. The codebase uses React Native with SQLite storage, targeting iOS and Android. Key gaps include app-blocking, animations, intention cycling, stats display, and analytics.

**Existing Structure**:
- **Navigation**: `App.tsx` with `NavigationContainer` and `createNativeStackNavigator`.
- **Screens**: `OnboardingScreen.tsx`, `TodoListScreen.tsx`, `TaskDetailsScreen.tsx`, `TimerScreen.tsx`.
- **Services**: `DatabaseService.ts`, `IntentionService.ts`, `SettingsService.ts`, `TimerService.ts`, `ExperienceService.ts`.
- **UI**: `colors.ts` (black, orange, grey Extends xAI product capabilities, red, blue), `spacing.ts`, `TaskCard.tsx`, `ExperienceBar.tsx`.
- **Dependencies**: `react-native-sqlite-storage`, `react-native-sound`, `react-native-safe-area-context`, `uuid`.

**Tech Constraints**:
- Local-only (SQLite, no cloud).
- No authentication.
- Bare React Native (no Expo).
- Target iOS 14+/Android 10+.

**Tone**: Brutal, focused, minimalistic—reflect the Monk Mode ethos in UX and code.

---

## 2. Tasks

### 2.1 Intention-Setting
**Goal**: Implement daily/weekly intention prompts with cycling suggestions and North Star designation.

**Tasks**:
1. **Update `OnboardingScreen.tsx`**:
   - Add welcome screen with fire-orange logo (`#FF6200`, `assets/logo.png` placeholder).
   - Prompt: “What’s the one win you want today?” (single text box).
   - Weekly prompt: “Set 3 intentions—1 North Star” (3 text boxes, tap one for North Star).
   - Reset day dropdown (default: Sunday).
   - Tone: “This is your vow. Forge it.” (bold, centered text).
   - Save to SQLite via `IntentionService.ts`.
   - Duration: 2-3 min flow.
2. **Implement Cycling Suggestions**:
   - Daily examples: ["Close 1 sales call", "Record 1 YouTube script", "Outline $10K offer"].
   - Weekly examples: ["Launch landing page", "Batch 5 posts", "Pitch 10 clients"].
   - Use `setInterval` to cycle every 3s (greyed-out, opacity 0.5).
   - Tap to select or type custom input.
   - Apply to `OnboardingScreen.tsx` and daily prompt (new `IntentionPrompt.tsx` component).
3. **Enhance `IntentionService.ts`**:
   - Add methods: `setDailyNorthStar(text: string)`, `setWeeklyIntentions(intentions: string[], northStarIndex: number)`.
   - Validate inputs (min 5 chars, max 100 chars).
   - Store in SQLite (`intentions` table: `id`, `text`, `isNorthStar`, `isDaily`, `createdAt`).
4. **UI Polish**:
   - North Star text box: Orange glow (`shadowColor: #FF6200`, `shadowRadius: 5`).
   - “Done” button: Orange background, white text, full-width.
   - Font: Inter (add via `react-native-vector-icons` or custom font).

**Files to Modify**:
- `src/screens/Onboarding/OnboardingScreen.tsx`
- `src/services/intention/IntentionService.ts`
- New: `src/components/intention/IntentionPrompt.tsx`

**Dependencies**:
- `react-native-vector-icons` (for Inter font, `npm install`).

**Estimated Time**: 1 week.

---

### 2.2 Dashboard (To-Do List)
**Goal**: Build a priority-based task list with North Star integration and swipe-to-timer.

**Tasks**:
1. **Update `TodoListScreen.tsx`**:
   - Add top bar:
     - Daily North Star: Orange, bold (`#FF6200`, `fontWeight: 700`).
     - Weekly intentions: Grey (`#999999`), horizontal scroll.
   - Task list sections: “Today”, “Next”, “Later” (collapsible via `TouchableOpacity`).
   - Render tasks using `TaskCard.tsx`.
2. **Enhance `TaskCard.tsx`**:
   - Display task title, North Star tag (orange glow if tagged).
   - Swipe right: Navigate to `TimerScreen` (`navigation.navigate('Timer', { taskId })`).
   - Checkmark: Call `TaskService.completeTask(taskId)` (+20 exp, +40 for North Star).
3. **Update `TaskDetailsScreen.tsx`**:
   - Show: Time (“Focus: 25 min, Rest: 5 min”), subtasks (collapsible `FlatList`), progress bar (`ProgressBar` component), notes (text input).
   - Buttons: “Start Timer”, “Add Subtask”, “Complete”.
   - Progress bar: Calculate % (e.g., 2/3 subtasks = 66%).
4. **Enhance `TaskService.ts`**:
   - Add methods: `getTasksByCategory(category: 'Today' | 'Next' | 'Later')`, `addSubtask(taskId: string, text: string)`.
   - Store subtasks in SQLite (`subtasks` table: `id`, `taskId`, `text`, `completed`).
5. **UI Polish**:
   - Black background (`#000000`), orange/grey accents.
   - Font: Inter, clean sans-serif.
   - Progress bar: Orange fill, grey track.

**Files to Modify**:
- `src/screens/TodoList/TodoListScreen.tsx`
- `src/components/task/TaskCard.tsx`
- `src/screens/TaskDetails/TaskDetailsScreen.tsx`
- `src/services/task/TaskService.ts`
- New: `src/components/common/ProgressBar.tsx`

**Dependencies**:
- `react-native-gesture-handler` (for swipe, `npm install`).

**Estimated Time**: 2 weeks.

---

### 2.3 Focus Timer
**Goal**: Implement a task-linked timer with Focus/Rest modes, app-blocking, and animations.

**Tasks**:
1. **Update `TimerScreen.tsx`**:
   - Modes: Focus (red fire, `#FF0000`), Rest (blue water, `#00B7EB`).
   - Display task title (Focus only, from `taskId`).
   - Options: Presets (25/5, 90/30, 50/10), Custom (sliders), Stopwatch (minutes).
   - Buttons: “Start/Pause”, “Switch Mode” (blue/red icon).
2. **Add Animations**:
   - Focus: Subtle flame animation (use `react-native-reanimated`).
   - Rest: Gentle wave animation (same library).
   - Ensure low battery impact (30 FPS max).
3. **Implement App-Blocking**:
   - **iOS**: Use Screen Time API (`react-native-screen-time`, placeholder package).
     - Full block: Prevent app launch.
     - Reminder: Show “You’re in Focus—resume?” (Yes/No).
     - Timer: 30s countdown (custom 10-60s).
   - **Android**: Use UsageStatsManager (`react-native-android-usage-stats`, placeholder).
     - Similar blocking options.
   - Default blocked apps: X, Instagram, YouTube (store in `SettingsService.ts`).
   - Log breaches to SQLite (`breaches` table: `id`, `appName`, `timestamp`).
4. **Add Haptics/Sound**:
   - Haptic buzz: Use `react-native` Vibration API at start/end.
   - Chime: Play via `react-native-sound` (`assets/sounds/chime.mp3` placeholder).
   - Toggle in settings.
5. **Enhance `TimerService.ts`**:
   - Add methods: `startFocus(taskId: string, duration: number)`, `startRest(duration: number)`, `logBreach(appName: string)`.
   - Sync time to tasks/intentions in SQLite (`time_logs` table: `id`, `taskId`, `mode`, `duration`, `timestamp`).
6. **UI Polish**:
   - Immersive full-screen, minimal text.
   - Font: Inter.
   - Swipe from `TaskCard` to enter.

**Files to Modify**:
- `src/screens/Timer/TimerScreen.tsx`
- `src/services/timer/TimerService.ts`
- `src/services/settings/SettingsService.ts`
- New: `src/components/animation/FlameAnimation.tsx`, `WaveAnimation.tsx`

**Dependencies**:
- `react-native-reanimated` (animations, `npm install`).
- `react-native-vibration` (haptics, `npm install`).
- Placeholder: `react-native-screen-time`, `react-native-android-usage-stats`.

**Estimated Time**: 3 weeks.

---

### 2.4 Profile/Settings
**Goal**: Create a Profile screen for stats and settings with brutal feedback.

**Tasks**:
1. **Create `ProfileScreen.tsx`**:
   - Stats:
     - “This Week: Xh Focus, Yh Rest, Z Distracted breaches”.
     - “Tasks Completed: N (M North Star)”.
     - Exp bar: “Monk Level L - X/500” (orange, `ExperienceBar.tsx`, resets weekly).
   - Navigation: Add to stack (`App.tsx`).
2. **Update `SettingsService.ts`**:
   - Add methods: `setResetDay(day: string)`, `setTimerPresets(presets: {focus: number, rest: number}[])`, `setBlockList(mode: 'Focus' | 'Rest', apps: string[])`, `toggleSound(enabled: boolean)`, `toggleHaptics(enabled: boolean)`.
   - Store in SQLite (`settings` table: `key`, `value`).
3. **Enhance `ExperienceService.ts`**:
   - Add methods: `getWeeklyStats()`, `resetWeeklyExp()`.
   - Calculate: Focus/Rest hours, breaches, tasks completed.
   - Exp rules: +10/focus hour, +20/task, x2 for North Star.
4. **UI Polish**:
   - Black base, orange accents, white stats (`#FFFFFF`).
   - Font: Inter.
   - Thin orange exp bar.

**Files to Modify**:
- `src/App.tsx`
- `src/services/settings/SettingsService.ts`
- `src/services/experience/ExperienceService.ts`
- `src/components/experience/ExperienceBar.tsx`
- New: `src/screens/Profile/ProfileScreen.tsx`

**Estimated Time**: 2 weeks.

---

### 2.5 Analytics
**Goal**: Track success metrics for launch validation.

**Tasks**:
1. **Integrate Firebase Analytics**:
   - Install: `react-native-firebase/analytics` (`npm install`).
   - Events:
     - `app_open`: Daily app opens.
     - `north_star_set`: Daily North Star set (80% target).
     - `focus_time`: Weekly Focus hours (5+ target).
     - `retention`: User returns after 30 days (70% target).
   - Log in `App.tsx` and relevant services.
2. **Store Metrics Locally**:
   - Add to SQLite (`analytics` table: `event`, `value`, `timestamp`).
   - Export to Firebase on app start (offline support).
3. **Test Metrics**:
   - Simulate 100 beta users (mock data in `mockData.ts`).
   - Verify event accuracy.

**Files to Modify**:
- `src/App.tsx`
- `src/services/storage/DatabaseService.ts`
- `src/services/task/mockData.ts`

**Dependencies**:
- `react-native-firebase/analytics` (`npm install`).

**Estimated Time**: 1 week.

---

## 3. Workflow
1. **Setup**:
   - Clone repo, run `npm install`, `bundle install`, `pod install` (iOS).
   - Verify build: `npm run ios`, `npm run android`.
2. **Task Order**:
   - Intention-Setting (core UX).
   - Dashboard (task organization).
   - Focus Timer (key feature).
   - Profile/Settings (feedback loop).
   - Analytics (validation).
3. **Coding**:
   - Use TypeScript, follow `.eslintrc.js`, `.prettierrc.js`.
   - Commit per feature: `git commit -m "Add intention cycling"`.
   - Test each component: Update `App.test.tsx`, run `npm test`.
4. **Validation**:
   - Match PRD UX: Black base, orange North Star, fire/water visuals.
   - Verify SQLite schema: Intentions, tasks, time logs, breaches.
   - Simulate beta: 100 users, 1 month, check metrics.
5. **Debugging**:
   - Log errors to console (`console.error`).
   - Test edge cases: Empty intentions, long tasks, app-block failures.

---

## 4. Deliverables
- Updated codebase with all features.
- SQLite schema: `intentions`, `tasks`, `subtasks`, `time_logs`, `breaches`, `settings`, `analytics`.
- Tests: 80% coverage (`jest.config.js`).
- Docs: Update `README.md` with feature list and setup.
- Beta report: Metrics for 100 users (downloads, North Star, Focus time, retention).

---

## 5. Success Criteria
- **Functionality**: All PRD features implemented (intention-setting, dashboard, timer, profile, analytics).
- **UX**: Black/orange/grey theme, fire/water animations, Inter font, brutal tone.
- **Performance**: <500ms screen load, <10% battery/hour (timer active).
- **Metrics**: Ready for 10K users (80% North Star, 5h Focus, 70% retention).

---

## 6. Notes
- **PRD Reference**: Intention-timer fusion, brutal Monk Mode ethos.
- **Risks**:
  - App-blocking APIs: Fallback to reminder pop-ups if restricted.
  - Animation lag: Cap at 30 FPS, test on low-end devices (e.g., iPhone 8, Android 10).
  - Vague intentions: Enforce validation (5+ chars).
- **Tone**: Code comments should be clear, minimal, intense—e.g., `// Locks focus, no mercy`.
- **Beta**: Target X/Reddit r/productivity for 100 testers.

Complete these tasks with relentless focus. Forge the app as a weapon for Monk Mode users.
