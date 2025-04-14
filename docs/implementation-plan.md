Implementation Guide for Migrating the Task Details Page to the New Implementation
This guide is tailored for an autonomous coding agent tasked with migrating the current Task Details page (the screen for creating or editing a task, implemented in TaskDetailsScreen.tsx) to align with the new design and functionality outlined in the pivot.md document. The focus is solely on enhancing the subtask functionality and UI/UX of this page, incorporating checklists, progress tracking, and a modern light-mode design inspired by Things3, while preserving Forge’s unique features like the Focus Timer. The agent will use the provided PRD.md, pivot.md, Repomix output, and attached screenshots (current_task vs. subtask) as context.

Task 1: Redesign UI to Light Mode with Things3 Color Scheme
Description
Transition the current Task Details page UI from its existing dark theme (likely black background with orange accents) to a light-mode design inspired by Things3. The new design will feature a white (#FFFFFF) or light gray (#F5F5F5) background, dark text (#333333), and a colorful palette (e.g., blue #4A90E2 for headers/buttons, green #50C878 for progress/North Star elements, red #FF4444 for overdue tasks). The layout should be minimalistic with ample white space and use a sans-serif font (e.g., Inter).

Current Implementation
The current_task screenshot shows the Task Details page with a white background, displaying fields for "Title," "Status" (TODO), "Priority" (MEDIUM), "Progress" (0 of 0 subtasks completed), and "Subtasks" (showing "No subtasks available"). Buttons for "Start Timer" (red) and "Complete Task" (blue) are present. The UI is functional but lacks modern aesthetics, sufficient white space, and a cohesive color scheme aligned with the pivot’s goals. The implementation is in TaskDetailsScreen.tsx, with colors likely defined in src/theme/colors.ts.

What Needs to Change
Replace the current white background with a light gray (#F5F5F5) base for a softer look.
Update text colors to dark gray (#333333) for readability.
Introduce a Things3-inspired palette: blue (#4A90E2) for headers/buttons, green (#50C878) for progress indicators, red (#FF4444) for overdue task highlights.
Increase padding and margins to create a minimalistic, spacious layout.
Ensure the design supports future dark mode readiness with conditional styling.
Files to Read for Context
PRD.md (Section 3.4: Visual tone guidelines for the original dark theme).
pivot.md (Section 3: UI Redesign for light-mode design and color scheme).
src/theme/colors.ts (Current color definitions).
src/screens/TaskDetails/TaskDetailsScreen.tsx (Current UI structure).
Files to Modify
src/theme/colors.ts (Update the color palette).
src/screens/TaskDetails/TaskDetailsScreen.tsx (Refactor styles and layout).
Subtask Breakdown
Update Theme Colors
Description: Modify src/theme/colors.ts to include the new light-mode scheme and prepare for dark mode.
Steps:
Replace or update background: '#000000' (if present) with background: '#F5F5F5'.
Replace or update primary: '#FF5722' (orange) with northStar: '#50C878' (green).
Add new colors: header: '#4A90E2', progress: '#50C878', overdue: '#FF4444', text: '#333333'.
Add a comment for future dark mode support: // Future dark mode: { background: '#1C2526', text: '#FFFFFF', ... }.
Tips:
Use React Native’s StyleSheet.create for consistent application of colors.
Test color contrast ratios (e.g., using WebAIM) to ensure accessibility.
Refactor Component Styles
Description: Update TaskDetailsScreen.tsx to apply the new color scheme and enhance the layout with white space.
Steps:
Update the main container’s backgroundColor to colors.background (#F5F5F5).
Change text colors for labels (e.g., "Title," "Status") to colors.text (#333333).
Style buttons:
"Start Timer": backgroundColor: colors.header (#4A90E2).
"Complete Task": backgroundColor: colors.header (#4A90E2), with conditional colors.overdue (#FF4444) if the task is overdue.
Increase container padding to 20 and element margin to 10 in StyleSheet.create for a spacious layout.
Tips:
Install react-native-vector-icons (npm install react-native-vector-icons) if not present, to add icons (e.g., a play icon for "Start Timer").
Ensure button states (e.g., pressed, disabled) use consistent variants of the new palette.
Ensure Dark Mode Readiness
Description: Add conditional styling in TaskDetailsScreen.tsx to support a future dark mode toggle.
Steps:
Add state: const [isDarkMode, setIsDarkMode] = useState(false) in TaskDetailsScreen.tsx.
Update styles with ternary operators, e.g., backgroundColor: isDarkMode ? '#1C2526' : colors.background.
Stub a connection to SettingsService.ts for toggle persistence (e.g., settingsService.getSetting('darkMode')).
Tips:
Use React’s useState and useEffect to manage and persist the dark mode state.
Test with a temporary toggle button to verify style switching.
Task 2: Enhance Subtasks with Checklists and Progress Tracking
Description
Upgrade the subtask section in the Task Details page to include interactive checklists with checkboxes and visual progress tracking (e.g., a progress bar), aligning with the pivot’s goal of enhanced subtasks. The current "No subtasks available" text should be replaced with a dynamic checklist, and progress should reflect completion status.

Current Implementation
The current_task screenshot shows a static "Subtasks" section with "No subtasks available" text and a progress indicator (0 of 0 subtasks completed). The SubtaskList.tsx and SubtaskProgress.tsx components manage subtasks, but they lack checklist functionality and dynamic progress updates. The task data is defined in Task.ts and managed by TaskService.ts.

What Needs to Change
Replace the static subtask text with an interactive checklist using checkboxes (e.g., via TouchableOpacity).
Extend the subtask model to include a checked: boolean field.
Implement a progress bar in SubtaskProgress.tsx showing the percentage of completed subtasks (e.g., 2/3 = 66%).
Ensure real-time updates when subtasks are checked or unchecked.
Files to Read for Context
pivot.md (Section 3: Feature Enhancements for subtask checklist details).
src/models/Task.ts (Current task and subtask model).
src/components/task/SubtaskList.tsx (Current subtask rendering).
src/components/task/SubtaskProgress.tsx (Current progress display).
src/services/task/TaskService.ts (Task management logic).
Files to Modify
src/models/Task.ts (Extend subtask model).
src/components/task/SubtaskList.tsx (Add checklist functionality).
src/components/task/SubtaskProgress.tsx (Add progress bar).
src/screens/TaskDetails/TaskDetailsScreen.tsx (Integrate updated components).
Subtask Breakdown
Extend Subtask Model
Description: Add a checked field to the subtask structure in Task.ts.
Steps:
Update the subtask interface in Task.ts to include checked: boolean (default false).
Modify TaskService.ts to handle toggling the checked state (e.g., add a toggleSubtask(taskId, subtaskId) method).
Tips:
Use uuid (already in package.json) to assign unique IDs to subtasks for tracking.
Ensure TypeScript type safety by updating related interfaces.
Implement Subtask Checklists
Description: Refactor SubtaskList.tsx to render interactive checkboxes for each subtask.
Steps:
Replace the static "No subtasks available" text with a FlatList rendering TouchableOpacity components for each subtask.
Add an onPress handler to toggle the checked state and update via TaskService.ts.
Style checkboxes: backgroundColor: colors.progress (#50C878) when checked, colors.text (#333333) outline when unchecked.
Tips:
Install react-native-gesture-handler (npm install react-native-gesture-handler) for smooth touch interactions.
Use react-native-vector-icons for checkmark icons (e.g., MaterialIcons "check-box").
Add Progress Tracking
Description: Enhance SubtaskProgress.tsx to display a dynamic progress bar.
Steps:
Calculate completion percentage: (checkedSubtasks.length / totalSubtasks.length) * 100.
Install and use react-native-progress (npm install react-native-progress) to render a Progress.Bar with color: colors.progress (#50C878).
Update the component to re-render on subtask state changes using React hooks (e.g., useEffect).
Tips:
Ensure the progress bar updates in real-time by subscribing to task state changes.
Test with edge cases (e.g., 0 subtasks) by displaying "0%" or hiding the bar.
Integrate into Task Details
Description: Update TaskDetailsScreen.tsx to incorporate the enhanced subtask components.
Steps:
Replace the existing subtask section with <SubtaskList task={task} />.
Add <SubtaskProgress task={task} /> below the subtask list.
Pass the task object and update callbacks to both components via props.
Tips:
Use React props to ensure data flows correctly from TaskDetailsScreen.tsx to child components.
Test with mock task data containing multiple subtasks to verify rendering.
Task 3: Maintain Focus Timer and Complete Task Integration
Description
Ensure the "Start Timer" and "Complete Task" buttons remain functional, adapting their visuals to the new light-mode design while preserving integration with the Focus Timer and task completion logic.

Current Implementation
The current_task screenshot shows "Start Timer" (red) and "Complete Task" (blue) buttons on the Task Details page. These buttons link to the Focus Timer (via TimerScreen.tsx) and task completion (via TaskService.ts), respectively. The styling is basic and not aligned with the pivot’s color scheme, and the implementation resides in TaskDetailsScreen.tsx.

What Needs to Change
Update button colors to match the new palette: both "Start Timer" and "Complete Task" should use colors.header (#4A90E2), with "Complete Task" turning colors.overdue (#FF4444) for overdue tasks.
Ensure buttons retain their functionality: "Start Timer" navigates to TimerScreen, and "Complete Task" calls taskService.completeTask.
Maintain subtle fire/water theme hints (e.g., via gradients or icons) in the light-mode design.
Files to Read for Context
PRD.md (Section 2.3: Focus Timer details; Section 2.2: Task completion).
pivot.md (Section 3: Unique Features for preserving timer integration).
src/screens/TaskDetails/TaskDetailsScreen.tsx (Current button implementation).
src/services/task/TaskService.ts (Task completion logic).
src/screens/Timer/TimerScreen.tsx (Timer screen navigation).
Files to Modify
src/screens/TaskDetails/TaskDetailsScreen.tsx (Update button styles and handlers).
Subtask Breakdown
Update Button Styles
Description: Refactor button styles in TaskDetailsScreen.tsx to use the new color scheme.
Steps:
Set backgroundColor: colors.header (#4A90E2) for both "Start Timer" and "Complete Task" buttons.
Add a conditional style for "Complete Task": backgroundColor: task.isOverdue ? colors.overdue : colors.header.
Add subtle fire (red #FF4444) and water (blue #4A90E2) hints using gradients or icons (e.g., a flame or wave icon).
Increase padding to 10 and borderRadius to 8 for a modern look.
Tips:
Install react-native-linear-gradient (npm install react-native-linear-gradient) for gradient effects if desired.
Use react-native-vector-icons for thematic icons (e.g., "play-arrow" for timer, "check" for completion).
Maintain Functionality
Description: Verify that button actions remain intact with the updated UI.
Steps:
Ensure "Start Timer" triggers navigation.navigate('Timer', { taskId: task.id }).
Ensure "Complete Task" calls taskService.completeTask(task.id).
Wrap service calls in try-catch blocks to handle errors gracefully (e.g., log errors with console.error).
Tips:
Test navigation and completion with mock tasks to ensure integration with TimerScreen.tsx and TaskService.ts.
Use react-navigation’s type safety for navigation props (e.g., RootStackParamList).
General Tips for the Agent
Libraries:
Install required libraries via npm if not present:
npm install react-native-vector-icons (for icons).
npm install react-native-progress (for progress bars).
npm install react-native-gesture-handler (for touch interactions).
npm install react-native-linear-gradient (for gradients, optional).
Testing:
Use existing Jest setup (e.g., App.test.tsx) to create unit tests for TaskDetailsScreen.tsx.
Test UI changes with React Native’s debug tools (e.g., toggle device preview for iOS/Android).
Add integration tests for subtask checklist and button functionality.
File Organization:
Keep modified components in their current locations (src/components/task/ for subtask components).
Update imports in TaskDetailsScreen.tsx to reflect any new dependencies.
Error Handling:
Implement try-catch blocks around service calls (e.g., TaskService.ts updates) to prevent crashes.
Display user-friendly error messages in the UI if operations fail.
Performance:
Optimize FlatList in SubtaskList.tsx with initialNumToRender={10} and maxToRenderPerBatch={10} for large subtask lists.
Accessibility:
Ensure color contrast meets WCAG 2.1 guidelines (e.g., 4.5:1 for text).
Add accessibilityLabel to interactive elements (e.g., buttons, checkboxes).