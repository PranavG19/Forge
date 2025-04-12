Implementation Guide for Completing "Monk Mode: Forge"
Introduction
This guide provides a detailed, step-by-step plan for Cline to autonomously complete the "Monk Mode: Forge" app, a React Native project aimed at helping users in "Monk Mode" achieve extreme focus and discipline. The app includes features like intention-setting, a priority-based to-do list, a focus timer with app-blocking, and a profile/settings section. The current codebase contains basic screens and services, but many features specified in the PRD (version 1.0, dated April 11, 2025) are incomplete or missing.

Purpose: This guide ensures Cline can read and follow deterministic instructions to implement all remaining features, leveraging its capabilities to read the codebase, interpret instructions, generate code, and modify existing components within VSCode.

Current Codebase Overview:

App.tsx: Main app component with navigation.
src/screens/: Screens for onboarding, to-do list, task details, and timer.
src/services/: Services for database, settings, intentions, tasks, timer, etc.
src/theme/: Theme definitions, including colors (e.g., black base, orange for North Star).
Note on Development Approach: The PRD mentions CursorAI for no-code development, but the codebase uses React Native. This guide assumes React Native was chosen for better control and customization. Cline should proceed with React Native, modifying and leveraging existing components.

Suggested Order of Implementation
To ensure dependencies and logical progression, implement features in this order:

Intention-Setting
To-Do List
Focus Timer
Profile/Settings
UX Flow
Technical Integrations
Feature Implementation
1. Intention-Setting during Onboarding
Files Involved:

src/screens/Onboarding/OnboardingScreen.tsx
src/services/intention/IntentionService.ts
src/services/storage/DatabaseService.ts
Requirements:

Prompt new users to set a daily "North Star" intention (e.g., "Close 1 sales call").
Provide cycling suggestions for the daily North Star, changing every 3 seconds, selectable by tapping.
Prompt for three weekly intentions, with one optionally designated as the weekly North Star.
Allow selection of a weekly reset day (default: Sunday).
Save all intentions and reset day to the database.
Implementation Steps:

Open src/screens/Onboarding/OnboardingScreen.tsx.
Add a <TextInput> for the daily North Star intention.
Implement cycling suggestions:
Define an array of suggestions (e.g., ["Close 1 sales call", "Record 1 YouTube script", "Write 500 words"]).
Use useState and useEffect with setInterval to cycle suggestions every 3 seconds.
Add an onPress handler to set the current suggestion as the North Star when tapped.
After the daily North Star is set, render three <TextInput> fields for weekly intentions.
Add a checkbox or star icon next to each weekly intention to designate one as the North Star.
Include a <Picker> or dropdown for the reset day, with options ["Sunday", "Monday", ..., "Saturday"] and default "Sunday".
On "Done" button press, call IntentionService.ts to save:
Daily North Star.
Weekly intentions (array with North Star flag).
Reset day.
Navigate to TodoList screen using the navigation prop.
Tips:

Use clearInterval in useEffect cleanup to avoid memory leaks.
Store intentions in DatabaseService.ts via IntentionService.ts (e.g., SQLite or AsyncStorage).
Default the weekly North Star to the first intention if none is selected.
Testing:

Check that suggestions cycle every 3 seconds and tapping selects one.
Verify daily North Star and weekly intentions save correctly.
Ensure reset day is stored and retrievable.
Confirm navigation to TodoList after completion.
2. Enhanced To-Do List
Files Involved:

src/screens/TodoList/TodoListScreen.tsx
src/components/task/TaskCard.tsx
src/services/task/TaskService.ts
src/services/intention/IntentionService.ts
src/services/experience/ExperienceService.ts
Requirements:

Categorize tasks into "Today," "Next," and "Later" sections.
Display daily North Star (orange, bold) and weekly intentions (grey) at the top.
Highlight North Star-linked tasks with an orange glow.
Enable swipe right to start the timer for a task.
Add a checkmark to complete tasks, awarding exp points (+20 regular, +40 North Star).
Implementation Steps:

Open src/screens/TodoList/TodoListScreen.tsx.
Fetch daily North Star and weekly intentions from IntentionService.ts.
Render:
Daily North Star in orange (color: "#FFA500", fontWeight: "bold").
Weekly intentions below, with North Star in orange, others in grey (color: "#808080").
Categorize tasks:
Use TaskService.ts to fetch tasks and sort into "Today," "Next," "Later" based on due date or priority.
Render as collapsible sections using a <FlatList> or <Accordion>.
In src/components/task/TaskCard.tsx:
Add conditional styling (e.g., borderColor: task.isNorthStar ? "#FFA500" : "transparent", borderWidth: 2) for North Star glow.
Use react-native-gesture-handler to implement swipe right, navigating to Timer with task.id.
Add a checkmark <TouchableOpacity>; on press:
Update task status in TaskService.ts.
Call ExperienceService.ts to add exp (task.isNorthStar ? 40 : 20).
Refresh the task list after completion.
Tips:

Install react-native-gesture-handler if not present (npm install react-native-gesture-handler).
Link tasks to North Star via a northStarId field in the task model.
Use useCallback to optimize gesture handlers.
Testing:

Ensure intentions display with correct styling.
Verify task categorization and collapsibility.
Test swipe-to-timer navigation with correct task ID.
Confirm exp points update correctly on task completion.
3. Focus Timer with Modes and App-Blocking
Files Involved:

src/screens/Timer/TimerScreen.tsx
src/services/timer/TimerService.ts
src/theme/colors.ts
Requirements:

Focus mode: Red fire background with flame animation.
Rest mode: Blue water background with wave animation.
Timer options: Presets (25/5, 90/30, 50/10), custom timer, stopwatch.
App-blocking in Focus mode (Full block, Reminder, Timer options).
Haptic feedback and sound at start/end.
Implementation Steps:

Open src/screens/Timer/TimerScreen.tsx.
Add state for mode ("focus" or "rest") and timer settings.
Implement animations:
Use <Animated.View> with backgroundColor: mode === "focus" ? "#FF0000" : "#0000FF".
Add subtle flame/wave effects (e.g., Lottie files or react-native-reanimated).
Render timer controls:
Buttons for presets (25/5, 90/30, 50/10), custom input, and stopwatch toggle.
Display linked task if passed from swipe.
In src/services/timer/TimerService.ts:
Create startTimer(duration, mode) to handle countdown and mode switching.
Use setInterval for ticking, saving state to resume if app is backgrounded.
For app-blocking:
Research iOS Screen Time API and Android UsageStatsManager.
Implement a basic version (e.g., overlay or notification) if full blocking isn’t feasible.
Tie to user-selected option (Full, Reminder, Timer).
Add react-native-haptic-feedback and react-native-sound for feedback at start/end.
Tips:

Install dependencies: npm install react-native-reanimated react-native-haptic-feedback react-native-sound.
Use AppState to handle background timer continuity.
Start with a simple app-blocking mock (e.g., alert) if OS integration is complex.
Testing:

Verify animations match modes (red fire for Focus, blue water for Rest).
Test all timer options for accuracy.
Check app-blocking functionality per selected option.
Ensure haptic feedback and sound trigger appropriately.
4. Profile/Settings Screen
Files Involved:

src/screens/ProfileSettings.tsx (create new)
src/services/settings/SettingsService.ts
src/services/experience/ExperienceService.ts
src/services/timer/TimerService.ts
src/services/task/TaskService.ts
Requirements:

Show stats: Focus time, Rest time, Distracted breaches, tasks completed, exp bar.
Settings: Weekly reset day, timer presets, Focus/Rest block lists, sound/haptics toggles.
Implementation Steps:

Create src/screens/ProfileSettings.tsx.
Fetch stats:
From TimerService.ts: Focus/Rest time, breaches.
From TaskService.ts: Tasks completed.
From ExperienceService.ts: Exp points and level.
Render stats and an exp bar (e.g., react-native-progress with progress: exp / nextLevelExp).
Add settings:
<Picker> for reset day.
Inputs for preset customization (e.g., array of { focus: 25, rest: 5 }).
Block list <FlatList> with add/remove and type picker (Full, Reminder, Timer).
<Switch> for sound and haptics.
Save changes to SettingsService.ts on update.
Tips:

Install react-native-progress (npm install react-native-progress).
Persist block lists as JSON in SettingsService.ts.
Calculate stats dynamically for real-time updates.
Testing:

Verify stats display accurately.
Check exp bar reflects progress.
Test each setting saves and applies correctly.
5. UX Flow for Daily and Weekly Intentions
Files Involved:

App.tsx
src/screens/Onboarding/OnboardingScreen.tsx
src/screens/TodoList/TodoListScreen.tsx
src/services/settings/SettingsService.ts
src/services/intention/IntentionService.ts
Requirements:

First login: Onboarding for intentions and reset day.
Daily: Prompt to set/review daily North Star.
Reset day: Prompt for new weekly intentions.
Implementation Steps:

In App.tsx, check SettingsService.ts for isOnboardingComplete; if false, navigate to OnboardingScreen.
In OnboardingScreen.tsx, set isOnboardingComplete: true after intentions are saved.
In App.tsx, on start:
Compare current date with reset day and last reset (stored in SettingsService.ts).
If reset day, show <Modal> to set new weekly intentions via IntentionService.ts.
Prompt daily North Star with a dismissible <Modal> or banner.
Update TodoListScreen.tsx to reflect new intentions.
Tips:

Use react-native-modal (npm install react-native-modal).
Store lastResetDate as a timestamp in SettingsService.ts.
Keep prompts lightweight and optional.
Testing:

Test onboarding on first launch.
Verify daily North Star prompt appears and saves.
Check reset day triggers weekly intention prompt.
6. Technical Integrations
Files Involved:

Varies by integration.
Requirements:

(Optional) Google Calendar API for read-only event access.
App-blocking via OS APIs.
Implementation Steps:

Google Calendar (Optional):
Install react-native-google-signin (npm install @react-native-google-signin/google-signin).
Implement OAuth flow and fetch events using Google Calendar API.
Display events in TodoListScreen.tsx.
App-Blocking:
iOS: Explore Screen Time API or custom overlay.
Android: Use UsageStatsManager or AccessibilityService.
Start with a simple implementation (e.g., warning when leaving app in Focus mode).
Integrate with TimerService.ts settings.
Tips:

Skip Calendar integration if time-constrained; mark as optional in code comments.
Use existing RN modules for app-blocking if available.
Testing:

Verify Calendar events display (if implemented).
Test app-blocking on iOS/Android during Focus mode.
Final Checklist
Before completion, Cline must confirm:

 All PRD features are implemented and functional.
 UI adheres to specs (black base, orange North Star, fire/water themes).
 App works on iOS and Android.
 Inputs are validated and errors handled.
 Database integrity is maintained.
 Performance is smooth (no lags/crashes).
 Changes are committed to version control.
Once checked, "Monk Mode: Forge" is ready for release.
