Thought for
61s
Expand for details
Below is a revised todo list for completing the "Monk Mode: Forge" app, tailored for an AI coding agent using Claude 3.5 in the Cline VSCode Extension. The agent will work from the project root directory (Forge/) and have access to the PRD (Forge/docs/PRD.md) and this list. I’ve included context on what’s already implemented so you know where to pick up, ensuring each step is clear, actionable, and self-contained. The app is partially built, and I’ll specify what exists versus what’s missing for each task.

Monk Mode: Forge - Todo List for Launch (with Context)
This todo list guides you to complete the "Monk Mode: Forge" app for launch. You’ll modify or create files as specified, reading others for context. Assume your context window resets between steps, so each task includes all necessary details. The app is a productivity tool with features like intention-setting, a task dashboard, a focus timer, and settings, all operating locally (no cloud).

Step 1: Enhance Onboarding with Cycling Suggestions and Reset Day Selection
Objective: Add cycling intention suggestions and a reset day picker to the onboarding flow.

Context:

Done: OnboardingScreen.tsx exists with basic UI for setting a daily intention. SettingsService.ts manages basic settings (e.g., theme).
Not Done: No suggestion cycling or reset day selection implemented.
Files to Modify:

src/screens/Onboarding/OnboardingScreen.tsx
src/services/settings/SettingsService.ts
Files to Create:

None
Files to Read for Context:

src/services/intention/IntentionService.ts (intention data structure)
src/theme/colors.ts (styling)
Instructions:

In OnboardingScreen.tsx:
Define arrays: dailySuggestions (e.g., ["Close 1 sales call", "Record 1 script"]) and weeklySuggestions (e.g., ["Launch landing page", "Batch 5 posts"]).
Use useState for current suggestion index and useEffect with setInterval to cycle suggestions every 3 seconds in the daily and weekly intention input placeholders.
Add an onPress handler to cycle manually on input tap.
Below the inputs, add a reset day picker UI (e.g., buttons for "Mon", "Tue", etc.) with onPress to save selection.
Style the daily intention input with an orange glow using colors.orange if it’s the North Star.
In SettingsService.ts:
Add setResetDay(day: string) to save the reset day (e.g., "Monday") to local storage (e.g., AsyncStorage or SQLite via DatabaseService.ts).
Add getResetDay(): string to retrieve it, defaulting to "Monday" if unset.
Step 2: Implement Weekly Intentions with North Star Selection
Objective: Enable setting three weekly intentions, with one as the North Star.

Context:

Done: OnboardingScreen.tsx handles daily intention input. IntentionService.ts stores daily intentions.
Not Done: Weekly intentions and North Star selection are missing.
Files to Modify:

src/screens/Onboarding/OnboardingScreen.tsx
src/services/intention/IntentionService.ts
Files to Create:

None
Files to Read for Context:

src/models/Task.ts (data structure reference)
src/theme/colors.ts (styling)
Instructions:

In OnboardingScreen.tsx:
Add three <TextInput> fields below the daily intention for weekly intentions.
Next to each, add a toggle/button to mark one as the North Star (only one can be selected).
Style the North Star input with an orange glow (colors.orange).
In IntentionService.ts:
Update the data model to include weeklyIntentions: { text: string, isNorthStar: boolean }[].
Add setWeeklyIntentions(intentions) to save the array, ensuring only one isNorthStar is true.
Add getWeeklyIntentions() to retrieve the array.
Step 3: Add Top Bar to Dashboard with Intentions Display
Objective: Display daily and weekly intentions in a dashboard top bar.

Context:

Done: TodoListScreen.tsx exists as the dashboard with a basic task list.
Not Done: No top bar or intention display.
Files to Modify:

src/screens/TodoList/TodoListScreen.tsx
Files to Create:

None
Files to Read for Context:

src/services/intention/IntentionService.ts (fetch intentions)
src/theme/colors.ts (styling)
Instructions:

In TodoListScreen.tsx:
Add a <View> at the top as a top bar (fixed height, e.g., 100px, background colors.darkGray).
Fetch intentions using IntentionService.getDailyIntention() and IntentionService.getWeeklyIntentions().
Display the daily intention and three weekly intentions (highlight the North Star with colors.orange).
Style text for readability (e.g., colors.white).
Step 4: Implement Task Categorization in Dashboard
Objective: Categorize tasks into "Today," "Next," and "Later" collapsible sections.

Context:

Done: TodoListScreen.tsx lists tasks flatly. TaskCard.tsx renders individual tasks.
Not Done: No categorization or collapsible UI.
Files to Modify:

src/screens/TodoList/TodoListScreen.tsx
src/components/task/TaskCard.tsx
Files to Create:

None
Files to Read for Context:

src/services/task/TaskService.ts (task data)
Instructions:

In TodoListScreen.tsx:
Fetch tasks with TaskService.getTasks().
Add a category property to the Task model if missing ("Today", "Next", "Later").
Install react-native-collapsible (npm install react-native-collapsible) and import Accordion.
Group tasks by category and render each group in an Accordion component.
In TaskCard.tsx:
Ensure task details (title, etc.) render correctly within the accordion.
Step 5: Add North Star Highlighting to Tasks
Objective: Highlight tasks linked to the North Star intention.

Context:

Done: TaskCard.tsx renders tasks.
Not Done: No North Star highlighting.
Files to Modify:

src/components/task/TaskCard.tsx
Files to Create:

None
Files to Read for Context:

src/services/intention/IntentionService.ts (North Star data)
src/theme/colors.ts (styling)
Instructions:

In TaskCard.tsx:
Check if the task’s intention matches the North Star using IntentionService.getWeeklyIntentions().
Apply an orange border or glow (colors.orange) to matching tasks.
Step 6: Implement Subtasks and Progress Bar in Task Details
Objective: Add subtasks and a progress bar to the task details screen.

Context:

Done: TaskDetailsScreen.tsx exists with basic task info. TaskService.ts manages tasks.
Not Done: No subtasks or progress bar.
Files to Modify:

src/screens/TaskDetails/TaskDetailsScreen.tsx
src/services/task/TaskService.ts
Files to Create:

None
Files to Read for Context:

src/models/Task.ts (data structure)
Instructions:

In TaskDetailsScreen.tsx:
Add a subtask UI (e.g., <TextInput> for adding, checkboxes for completion).
Render a progress bar (e.g., <Progress.Bar> from react-native-paper) showing completed subtasks percentage.
In TaskService.ts:
Update Task to include subtasks: { text: string, completed: boolean }[].
Add addSubtask(taskId, text) and toggleSubtask(taskId, subtaskIndex).
Step 7: Add Swipe-to-Timer Gesture in Task List
Objective: Enable swipe-right on tasks to start the timer.

Context:

Done: TaskCard.tsx renders tasks. TimerScreen.tsx exists for timer functionality.
Not Done: No swipe gesture.
Files to Modify:

src/components/task/TaskCard.tsx
Files to Create:

None
Files to Read for Context:

src/screens/Timer/TimerScreen.tsx (navigation target)
Instructions:

In TaskCard.tsx:
Install react-native-gesture-handler (npm install react-native-gesture-handler).
Import Swipeable and wrap the task UI in it.
On swipe-right, navigate to TimerScreen with the task ID (e.g., navigation.navigate('Timer', { taskId })).
Step 8: Enhance Task Details Screen
Objective: Add time, subtasks, progress, notes, and action buttons.

Context:

Done: TaskDetailsScreen.tsx shows basic task info.
Not Done: Missing detailed elements and buttons.
Files to Modify:

src/screens/TaskDetails/TaskDetailsScreen.tsx
Files to Create:

None
Files to Read for Context:

src/services/task/TaskService.ts (task data)
src/services/timer/TimerService.ts (time data)
Instructions:

In TaskDetailsScreen.tsx:
Display Focus/Rest time (from TimerService.getTaskTime(taskId)), subtasks, progress bar, and a <TextInput> for notes.
Add buttons: "Start Timer" (to TimerScreen), "Add Subtask" (calls TaskService.addSubtask), "Complete" (updates task status).
Step 9: Implement Fire and Water Visuals in Timer Screen
Objective: Add fire (Focus) and water (Rest) visuals with animations.

Context:

Done: TimerScreen.tsx has basic timer logic.
Not Done: No themed visuals or animations.
Files to Modify:

src/screens/Timer/TimerScreen.tsx
Files to Create:

None
Files to Read for Context:

src/theme/colors.ts (colors)
Instructions:

In TimerScreen.tsx:
Install react-native-animatable (npm install react-native-animatable).
Set background to colors.red for Focus, colors.blue for Rest.
Add an <Animatable.View> (e.g., fade or pulse) for flame/wave effects.
Step 10: Implement App-Blocking for Focus and Rest Modes
Objective: Add platform-specific app-blocking.

Context:

Done: None.
Not Done: No app-blocking implemented.
Files to Modify:

src/screens/Timer/TimerScreen.tsx
src/services/settings/SettingsService.ts
Files to Create:

android/app/src/main/java/com/forge/BlockAppsModule.java (Android)
ios/Forge/BlockApps.m (iOS)
Files to Read for Context:

None
Instructions:

Android (BlockAppsModule.java):
Create a basic native module using UsageStatsManager (log attempts for now).
iOS (BlockApps.m):
Create a stub using Screen Time API (log attempts).
In TimerScreen.tsx:
Call the native module to enable blocking during Focus/Rest based on SettingsService.getBlockedApps().
In SettingsService.ts:
Add setBlockedApps(apps: string[]) and getBlockedApps().
Step 11: Add Blocking Options UI
Objective: Provide UI for blocking options and app lists.

Context:

Done: None.
Not Done: No blocking configuration UI.
Files to Modify:

src/screens/Timer/TimerScreen.tsx
src/services/settings/SettingsService.ts
Files to Create:

None
Files to Read for Context:

None
Instructions:

In TimerScreen.tsx:
Add toggles for blocking modes (Full, Reminder, Timer) and a list editor for blocked apps.
In SettingsService.ts:
Add setBlockingMode(mode: string) and getBlockingMode().
Step 12: Integrate Haptics and Sound
Objective: Add haptic feedback and sound for timer events.

Context:

Done: None.
Not Done: No haptics or sound.
Files to Modify:

src/screens/Timer/TimerScreen.tsx
Files to Create:

None
Files to Read for Context:

None
Instructions:

In TimerScreen.tsx:
Install react-native-haptic-feedback (npm install react-native-haptic-feedback) and react-native-sound (npm install react-native-sound).
Trigger haptic feedback and a chime at timer start/end.
Step 13: Sync Timer Logs to Tasks and Intentions
Objective: Log Focus/Rest time to tasks and intentions.

Context:

Done: TimerService.ts manages timer logic.
Not Done: No logging to tasks/intentions.
Files to Modify:

src/services/timer/TimerService.ts
src/services/task/TaskService.ts
src/services/intention/IntentionService.ts
Files to Create:

None
Files to Read for Context:

src/services/storage/DatabaseService.ts (storage)
Instructions:

In TimerService.ts:
Add logTime(taskId, mode, duration) to save to DatabaseService.
In TaskService.ts and IntentionService.ts:
Update to aggregate logged time per task/intention.
Step 14: Create Profile/Settings Screen
Objective: Add a screen for stats and settings.

Context:

Done: None.
Not Done: No profile/settings screen.
Files to Modify:

App.tsx
Files to Create:

src/screens/Profile/ProfileScreen.tsx
Files to Read for Context:

src/services/settings/SettingsService.ts
src/services/experience/ExperienceService.ts
Instructions:

In App.tsx:
Add ProfileScreen to the navigation stack.
In ProfileScreen.tsx:
Display stats (Focus, Rest, tasks completed) and settings (reset day, timer presets, blocking).
Step 15: Implement Experience System
Objective: Add XP points and a progress bar.

Context:

Done: ExperienceService.ts and ExperienceBar.tsx may exist partially.
Not Done: Full XP logic and UI incomplete.
Files to Modify:

src/services/experience/ExperienceService.ts
src/components/experience/ExperienceBar.tsx
src/screens/Profile/ProfileScreen.tsx
Files to Create:

None
Files to Read for Context:

None
Instructions:

In ExperienceService.ts:
Add logic: +10 XP/hour, +20 XP/task, 2x for North Star tasks.
In ExperienceBar.tsx:
Render a progress bar with XP and level.
In ProfileScreen.tsx:
Include ExperienceBar.
Step 16: Add Weekly Reset Prompt
Objective: Prompt for new weekly intentions on reset day.

Context:

Done: None.
Not Done: No reset mechanism.
Files to Modify:

App.tsx
src/services/settings/SettingsService.ts
Files to Create:

None
Files to Read for Context:

src/services/intention/IntentionService.ts
Instructions:

In App.tsx:
On start, check if today matches SettingsService.getResetDay().
Show a modal to set weekly intentions if true.
Step 17: Track Distracted Time (Breach Attempts)
Objective: Log attempts to open blocked apps.

Context:

Done: None.
Not Done: No breach tracking.
Files to Modify:

android/app/src/main/java/com/forge/BlockAppsModule.java
ios/Forge/BlockApps.m
src/services/storage/DatabaseService.ts
Files to Create:

None
Files to Read for Context:

None
Instructions:

In native modules:
Log breach attempts to DatabaseService.
In DatabaseService.ts:
Add logBreachAttempt().
Step 18: Verify Local-Only Operation
Objective: Ensure no cloud/premium features.

Context:

Done: App uses SQLite via DatabaseService.ts.
Not Done: Verification needed.
Files to Modify:

None
Files to Read for Context:

src/services/storage/DatabaseService.ts
App.tsx
Instructions:

Review DatabaseService.ts and App.tsx to ensure all data is local and no cloud code exists.
Step 19: Test and Verify
Objective: Confirm all features work per PRD.

Context:

Done: Partial app built.
Not Done: Full testing.
Files to Modify:

None
Files to Read for Context:

All modified files
Instructions:

Test on iOS/Android simulators/devices.
Verify UI, SQLite data, and PRD compliance.