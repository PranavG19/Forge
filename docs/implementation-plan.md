Thought for
81s
Expand for details
Below is a detailed implementation guide for completing the "Monk Mode: Forge" app, designed to ensure an agentic coding agent can finish all remaining tasks, fixes, and improvements to meet the Product Requirements Document (PRD) requirements. This guide assumes the agent has access to the PRD and the current React Native codebase. Each task is presented in a to-do list format with clear instructions, success criteria, and tips to facilitate implementation.

Implementation Guide for "Monk Mode: Forge" App
This guide outlines the steps to fully complete the "Monk Mode: Forge" app, ensuring all features, fixes, and improvements align with the PRD. The app is built in React Native, so instructions are tailored to that environment, leveraging components, navigation, and native modules as needed.

1. Enhance Onboarding
Objective: Create a comprehensive onboarding process that sets daily and weekly intentions, designates a North Star, sets the reset day, and configures app-blocking preferences.

1.1 Add Intention-Setting Prompts with Cycling Suggestions
Instructions:
Update OnboardingScreen.tsx to include two text input fields: one for the daily North Star and one for weekly intentions.
Implement a cycling suggestion mechanism:
Use a timer to cycle through predefined suggestions every 3 seconds.
Allow manual cycling by tapping the suggestion text.
Display suggestions in grey until selected, then make them editable.
Use these suggestion lists:
Daily: ["Close 1 sales call", "Record 1 YouTube script", "Outline $10K offer", "Meditate 20 min"]
Weekly: ["Launch side hustle landing page", "Batch 5 blog posts", "Pitch 10 clients", "Hit 5 gym sessions"]
Add a "Done" button to save intentions to SQLite via DatabaseService.ts.
Success Criteria:
Suggestions cycle automatically every 3 seconds and respond to taps for manual cycling.
Users can select a suggestion or input custom text.
Saved intentions are retrievable from the database.
Tips:
Use setInterval for automatic cycling and clear it on selection.
Store suggestions in a state array and update the index for cycling.
1.2 Implement North Star Designation
Instructions:
For weekly intentions, add a toggle button or checkbox next to each to designate it as the North Star.
Highlight the selected North Star with an orange glow (e.g., borderColor: '#FF6200').
Ensure only one intention can be the North Star.
Success Criteria:
Only one weekly intention is selectable as the North Star.
The North Star intention is visually distinct with an orange glow.
Tips:
Use a state variable to track the North Star index or ID.
Apply conditional styling based on the North Star status.
1.3 Set the Weekly Reset Day
Instructions:
Add a dropdown or picker component to select a weekly reset day (e.g., Sunday, Monday, etc.).
Set the default to Sunday.
Save the selection to SettingsService.ts.
Success Criteria:
Users can choose a reset day from a list of weekdays.
The selected day is persisted and retrievable.
Tips:
Use a React Native picker component (e.g., @react-native-picker/picker).
Validate that the saved day matches the user’s selection.
1.4 Configure App-Blocking Preferences
Instructions:
Add a section to select apps to block during Focus and Rest modes.
Provide a default list (e.g., X, Instagram, YouTube) with options to add or remove apps.
Include a mode selector for each list: Full, Reminder, or Timer (default 30s countdown).
Save settings via SettingsService.ts.
Success Criteria:
Users can customize block lists for both modes.
Blocking mode settings are saved and applied correctly.
Settings persist across app restarts.
Tips:
Use a multi-select list component for app selection.
Store settings as a JSON object with lists and modes.
2. Develop Dashboard (To-Do List)
Objective: Build a fully functional to-do list with categorized tasks, intention integration, and detailed views.

2.1 Categorize Tasks into "Today," "Next," "Later"
Instructions:
In TodoListScreen.tsx, create three collapsible sections: "Today," "Next," "Later."
Allow users to assign tasks to these categories during creation or editing.
Success Criteria:
Tasks appear under their assigned categories.
Sections can be expanded or collapsed by tapping.
Tips:
Use a collapsible component (e.g., react-native-collapsible).
Add a category field to the task schema in SQLite.
2.2 Display Daily North Star and Weekly Intentions
Instructions:
At the top of TodoListScreen.tsx, display the daily North Star in bold orange text (e.g., #FF6200).
Below it, list weekly intentions in grey (e.g., #666666), with the North Star intention highlighted in orange.
Success Criteria:
Daily North Star and weekly intentions are visible on the dashboard.
The North Star intention stands out visually.
Tips:
Fetch intentions from SQLite on screen mount using useEffect.
Use inline styles or a stylesheet for consistent theming.
2.3 Link Tasks to Intentions and Highlight North Star Tasks
Instructions:
Add an intention dropdown during task creation/editing to link tasks to intentions.
Highlight tasks linked to the North Star intention with an orange glow.
Success Criteria:
Tasks can be associated with specific intentions.
North Star tasks are visually distinct.
Tips:
Store the linked intention ID in the task schema.
Apply dynamic styling based on the intention’s North Star status.
2.4 Enhance Task Details
Instructions:
In TaskDetailsScreen.tsx, add:
Time settings (Focus and Rest durations in minutes).
Subtasks with individual time estimates and completion toggles.
A progress bar reflecting subtask completion percentage.
A notes text area for free input.
Include buttons: "Start Timer," "Add Subtask," "Complete."
Success Criteria:
Task details display all specified fields and buttons.
Progress bar updates as subtasks are completed.
Tips:
Calculate progress as (completedSubtasks / totalSubtasks) * 100.
Use a FlatList for subtasks and a ProgressBar component.
2.5 Add Swipe-to-Timer and Checkmark-to-Complete Functionality
Instructions:
Implement swipe gestures on tasks in TodoListScreen.tsx to navigate to TimerScreen.tsx.
Add a checkmark icon to mark tasks complete, awarding exp points (+20, +40 for North Star tasks).
Update task status and exp in SQLite.
Success Criteria:
Swiping a task opens the timer with the task pre-loaded.
Completing a task updates its status and adds correct exp points.
Tips:
Use react-native-gesture-handler for swipe actions.
Pass the task ID to the timer screen via navigation params.
3. Implement Focus Timer
Objective: Develop a timer with Focus and Rest modes, visual themes, app-blocking, and logging.

3.1 Create Focus and Rest Modes with Visual Themes
Instructions:
In TimerScreen.tsx, implement:
Focus Mode: Red fire background with subtle flame animation.
Rest Mode: Blue water background with gentle wave animation.
Add a toggle to switch between modes.
Success Criteria:
Each mode has a distinct visual theme (red fire, blue water).
Users can switch modes seamlessly.
Tips:
Use react-native-reanimated for animations.
Store the current mode in state and update the UI accordingly.
3.2 Add Timer Presets, Custom Options, and Stopwatch
Instructions:
Add preset buttons: 25/5, 90/30, 50/10 (Focus/Rest minutes).
Include input fields for custom Focus and Rest durations.
Implement a stopwatch mode that counts up from zero.
Success Criteria:
Users can select presets, set custom times, or use the stopwatch.
Timer functions correctly for all options.
Tips:
Use a segmented control or buttons for presets.
Implement a reusable timer component with mode-specific logic.
3.3 Integrate App-Blocking with Different Modes
Instructions:
Use OS-specific APIs to block apps based on user settings:
iOS: Screen Time API.
Android: UsageStatsManager or AccessibilityService.
Support Full, Reminder, and Timer (30s countdown) modes.
Log breaches when blocked apps are accessed.
Success Criteria:
Apps are blocked according to the selected mode.
Breach attempts are recorded in SQLite.
Tips:
Create native modules if no suitable library exists.
Test blocking behavior on physical devices.
3.4 Implement Haptic Feedback and Sound Notifications
Instructions:
Add haptic feedback at timer start and end using react-native-haptic-feedback.
Play a chime sound at start and end using react-native-sound.
Add toggles for these in settings.
Success Criteria:
Haptic feedback and sounds trigger at the correct times.
Toggles enable/disable these features.
Tips:
Preload sound files to avoid playback delays.
Test haptics on different devices for consistency.
3.5 Log Time to Tasks and Intentions
Instructions:
In TimerService.ts, log time spent in Focus or Rest to the associated task and intention when the timer stops.
Update task progress and award exp points (+10 per Focus hour).
Success Criteria:
Time logs are saved with task and intention IDs.
Exp points reflect time spent accurately.
Tips:
Use a structured log schema (e.g., { taskId, intentionId, mode, duration }).
Ensure logs are timestamped for stat calculations.
4. Build Profile/Settings Screen
Objective: Create a screen for stats and settings management.

4.1 Display Stats
Instructions:
Create ProfileScreen.tsx to show:
Weekly stats: Focus time, Rest time, Distracted breaches.
Tasks completed (highlight North Star tasks).
Exp bar: "Monk Level X - Y/Z" with a progress bar.
Calculate levels (e.g., 100 exp per level).
Success Criteria:
Stats reflect user activity accurately.
Exp bar shows current level and progress.
Tips:
Fetch data from SQLite using aggregate queries.
Use a progress bar component with dynamic values.
4.2 Include Settings
Instructions:
Add settings options:
Weekly reset day picker.
Timer preset adjustments.
Focus and Rest block lists with mode selectors.
Sound and haptics toggles.
Save via SettingsService.ts.
Success Criteria:
Users can modify and save all settings.
Changes apply immediately or on app restart.
Tips:
Use form components (e.g., switches, pickers).
Validate settings before saving.
5. Complete UX Flow
Objective: Ensure a seamless user experience from onboarding to daily use.

5.1 Finalize Onboarding
Instructions:
Ensure OnboardingScreen.tsx includes all steps: intentions, North Star, reset day, block lists.
Navigate to TodoListScreen.tsx on completion.
Success Criteria:
Onboarding covers all required steps.
Users land on the dashboard after finishing.
Tips:
Use a multi-step navigation stack or modal sequence.
Add a progress indicator for clarity.
5.2 Implement Daily Flow
Instructions:
On app launch, prompt users to set or confirm their daily North Star.
Ensure smooth navigation between dashboard, timer, and profile.
Success Criteria:
Daily North Star prompt appears on login.
Navigation is intuitive and fast.
Tips:
Use a modal for the daily prompt.
Implement a bottom tab or drawer navigation.
5.3 Handle Weekly Reset Logic
Instructions:
On the reset day, prompt for new weekly intentions.
Reset exp points and archive old stats.
Success Criteria:
Reset triggers on the correct day with an intention prompt.
Exp resets and stats update accordingly.
Tips:
Check the reset day on app launch using the current date.
Store reset history to avoid duplicate resets.
6. Technical Integrations
Objective: Integrate external APIs and native features.

6.1 Integrate Google Calendar API
Instructions:
Add read-only Google Calendar access for optional event display on the dashboard.
Handle OAuth authentication and permissions.
Success Criteria:
Users can link their calendar.
Events are fetched and displayed correctly.
Tips:
Use react-native-google-signin for authentication.
Cache events locally to reduce API calls.
6.2 Implement App-Blocking Using OS APIs
Instructions:
Use iOS Screen Time API and Android UsageStatsManager to enforce app blocking.
Request necessary permissions during onboarding.
Success Criteria:
Blocked apps are restricted per user settings.
Permissions are granted and handled gracefully.
Tips:
Write platform-specific native modules if needed.
Provide fallback UI for denied permissions.
6.3 Add Haptic Feedback and Sound
Instructions:
Integrate react-native-haptic-feedback for vibrations.
Use react-native-sound for chime notifications.
Trigger at timer start/end and task completion.
Success Criteria:
Feedback enhances key interactions.
Features are toggleable in settings.
Tips:
Test on multiple devices for consistency.
Use lightweight sound files (e.g., MP3).
7. Data Tracking Enhancements
Objective: Extend logging to cover all time categories.

7.1 Extend Timer Service
Instructions:
In TimerService.ts, log:
Focus time.
Rest time.
Distracted breaches (app access attempts).
Link logs to tasks and intentions.
Success Criteria:
All time categories are logged accurately.
Logs are queryable for stats.
Tips:
Use an enum for categories (e.g., FOCUS, REST, DISTRACTED).
Include timestamps in logs for precision.
8. Improvements
Objective: Enhance visuals, feedback, gamification, usability, and performance.

8.1 Visual Refinements
Instructions:
Update colors.ts with: black base (#000000), orange North Star (#FF6200), grey others (#666666).
Add fire and water animations to timer modes using react-native-reanimated.
Success Criteria:
App visuals match the PRD’s brutal, intense theme.
Animations are smooth and lightweight.
Tips:
Use Lottie or vector animations for efficiency.
Test on low-end devices for performance.
8.2 User Feedback Mechanisms
Instructions:
Add subtle breach notifications (e.g., “You slipped—back to work”).
Enhance haptic feedback for task completion.
Success Criteria:
Feedback is timely and non-disruptive.
Improves user engagement.
Tips:
Use toast notifications for messages.
Limit feedback frequency to key events.
8.3 Minimal Gamification
Instructions:
Add a level-up animation to the exp bar (e.g., brief glow or confetti).
Keep gamification subtle per PRD ethos.
Success Criteria:
Exp system is motivating but not distracting.
Level-ups are visually acknowledged.
Tips:
Use a simple animation library for level-ups.
Avoid excessive effects to maintain focus.
8.4 Usability Enhancements
Instructions:
Implement auto-save for intentions and settings changes.
Enable one-tap timer start from task swipe.
Success Criteria:
Input steps are minimized.
Key actions are quick and intuitive.
Tips:
Use debounced saves to optimize database writes.
Highlight tappable areas with visual cues.
8.5 Performance Optimizations
Instructions:
Optimize SQLite queries in DatabaseService.ts with indexes.
Reduce timer update frequency to once per second.
Success Criteria:
App loads and runs smoothly.
Battery usage is reasonable during timer operation.
Tips:
Profile query performance with large datasets.
Use requestAnimationFrame for timer updates.
Final Validation Checklist
Before marking the implementation complete, verify:

All PRD requirements are implemented and functional.
The app runs stably on iOS and Android.
User data is securely stored and managed.
Visuals and UX reflect the Monk Mode ethos: brutal, simple, intense.
All success criteria in this guide are met through testing.
