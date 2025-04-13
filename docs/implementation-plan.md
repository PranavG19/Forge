Implementation Guide for Pivoting Forge's Todo List Feature
Task 1: Redesign UI to Light Mode with Things3 Color Scheme
Description: Transition the dark-themed UI to a light mode design inspired by Things3, using a white/light gray background, dark text, and colorful accents (e.g., blue, green, red), ensuring a calming, minimalistic look adaptable for future dark mode.
Current Implementation: Black background (colors.background in src/theme/colors.ts), orange North Star (colors.primary), grey accents, as seen in App.tsx and TodoListScreen.tsx. Styles use StyleSheet.create with minimal white space.
What to Change To: Light mode with white (#FFFFFF) or light gray (#F5F5F5) background, dark text (#333333), and Things3-inspired palette (e.g., blue #4A90E2 for headers, green #50C878 for North Star, red #FF4444 for overdue tasks). Use ample white space and sans-serif fonts (e.g., Inter).
Subtasks:
Update Theme Colors
Description: Modify src/theme/colors.ts to reflect the new light mode scheme.
Files to Read: src/theme/colors.ts (current colors), PRD (Section 3.4 for visual tone).
Files to Modify: src/theme/colors.ts
Subtask Breakdown:
Replace background: '#000000' with background: '#F5F5F5'.
Replace primary: '#FF5722' with northStar: '#50C878'.
Add colors: header: '#4A90E2', text: '#333333', overdue: '#FF4444'.
Add comment: // Future dark mode: Add variants here.
Tips: Use React Native’s color utilities (e.g., rgba) for consistency. Test readability with StyleSheet.create.
Refactor Component Styles
Description: Update TodoListScreen.tsx and App.tsx styles to use the new scheme and improve layout.
Files to Read: src/screens/TodoList/TodoListScreen.tsx, App.tsx, src/theme/colors.ts.
Files to Modify: src/screens/TodoList/TodoListScreen.tsx, App.tsx
Subtask Breakdown:
In TodoListScreen.tsx, update backgroundColor: colors.background to new light gray.
Update headerStyle in Stack.Navigator (App.tsx) to backgroundColor: colors.header.
Add padding: 20 in StyleSheet.create for white space.
Replace orange buttons with colorful icons (e.g., blue/green/red) using react-native-vector-icons.
Tips: Install react-native-vector-icons via npm install if missing. Ensure icons align with the palette.
Ensure Dark Mode Readiness
Description: Add a toggle mechanism for future dark mode support.
Files to Read: src/services/settings/SettingsService.ts, src/theme/colors.ts.
Files to Modify: src/theme/colors.ts, src/screens/TodoList/TodoListScreen.tsx
Subtask Breakdown:
In colors.ts, add darkMode: { background: '#1C2526', ... }.
In TodoListScreen.tsx, add const [isDarkMode, setIsDarkMode] = useState(false) and conditional styling: backgroundColor: isDarkMode ? colors.darkMode.background : colors.background.
Link to SettingsService.ts for toggle persistence later.
Tips: Use React’s useState for isDarkMode. Test with a mock toggle.
Task 2: Restructure Views with Daily North Star and New Categories
Description: Reorganize the todo list to display the Daily North Star at the top, followed by "Today," "Upcoming," and "Someday" views, with "Projects" as a separate navigable area, preparing for calendar integration.
Current Implementation: TodoListScreen.tsx uses tabs ("Today," "Next," "Later") with collapsible sections via TaskSection.tsx, managed by TaskService.ts. North Star is a text input with orange glow.
What to Change To: Daily North Star as a fixed header, "Today" (tasks due today + North Star + calendar events), "Upcoming" (future tasks), "Someday" (unscheduled tasks), and "Projects" as a bottom-tab-navigated screen.
Subtasks:
Update North Star Display
Description: Move Daily North Star to a fixed header.
Files to Read: src/screens/TodoList/TodoListScreen.tsx, src/services/intention/IntentionService.ts.
Files to Modify: src/screens/TodoList/TodoListScreen.tsx
Subtask Breakdown:
Create NorthStarHeader.tsx component to render North Star.
Style with colors.northStar and bold text.
Position above task sections with flexDirection: 'column'.
Tips: Use useEffect to fetch North Star from IntentionService.ts. Ensure responsiveness with Dimensions.
Redefine Task Categories
Description: Map tasks to "Today," "Upcoming," "Someday" based on due dates.
Files to Read: src/models/Task.ts, src/services/task/TaskService.ts, src/services/calendar/CalendarService.ts.
Files to Modify: src/services/task/TaskService.ts, src/screens/TodoList/TodoListScreen.tsx
Subtask Breakdown:
In TaskService.ts, add categorizeTasks method: today (due today), upcoming (due within 7 days), someday (no due date).
Update TodoListScreen.tsx to render categories with FlatList.
Add placeholder toggle for calendar events (e.g., showCalendarEvents).
Tips: Use date-fns for date handling (install if needed). Stub calendar integration for later.
Implement Navigation to Projects
Description: Add a bottom tab for "Projects" view.
Files to Read: App.tsx, src/screens/TodoList/TodoListScreen.tsx.
Files to Modify: App.tsx, src/screens/TodoList/TodoListScreen.tsx
Subtask Breakdown:
In App.tsx, add Projects screen to Stack.Navigator.
Create src/screens/Projects/ProjectsScreen.tsx with basic layout.
Use @react-navigation/bottom-tabs for navigation.
Tips: Install @react-navigation/bottom-tabs if missing. Use createBottomTabNavigator.
Task 3: Implement Projects and Subtasks
Description: Introduce projects as task containers, with one marked as North Star, and enhance subtasks with checklists.
Current Implementation: Tasks are standalone with basic subtasks in SubtaskList.tsx and SubtaskProgress.tsx, managed by TaskService.ts.
What to Change To: Projects with tasks and subtasks, one project as North Star, and checklists with progress indicators.
Subtasks:
Define Project Structure
Description: Extend Task.ts to link to projects.
Files to Read: src/models/Task.ts, src/services/task/TaskService.ts.
Files to Modify: src/models/Task.ts, src/services/task/TaskService.ts
Subtask Breakdown:
Add projectId: string and isNorthStar: boolean to Task.ts.
Update TaskService.ts to group tasks by projectId.
Tips: Use uuid (already in package.json) for projectId. Sync isNorthStar with IntentionService.ts.
Implement Subtask Checklists
Description: Enhance SubtaskList.tsx with checkboxes.
Files to Read: src/components/task/SubtaskList.tsx, src/components/task/SubtaskProgress.tsx.
Files to Modify: src/components/task/SubtaskList.tsx, src/components/task/SubtaskProgress.tsx
Subtask Breakdown:
Add checked: boolean to subtask objects.
Use TouchableOpacity for checkboxes in SubtaskList.tsx.
Update SubtaskProgress.tsx to show percentage complete.
Tips: Use react-native-gesture-handler for interactions. Test progress updates.
Create Projects Screen
Description: Build ProjectsScreen.tsx to display projects.
Files to Read: src/services/task/TaskService.ts, src/theme/colors.ts.
Files to Modify: src/screens/Projects/ProjectsScreen.tsx (new file)
Subtask Breakdown:
List projects with FlatList, showing title and progress pie.
Style with colors.header.
Add button to create new projects.
Tips: Use react-native-chart-kit (in package.json) for pies. Save projects via TaskService.ts.
Task 4: Enhance Task Features
Description: Add tags, reminders, and natural language input for tasks.
Current Implementation: Tasks have basic fields (title, category, subtasks) in Task.ts, managed by TaskService.ts.
What to Change To: Include tags, reminders, and "Jump Start" natural language input.
Subtasks:
Add Tags to Tasks
Description: Extend Task.ts with tags for quick find.
Files to Read: src/models/Task.ts, src/services/task/TaskService.ts.
Files to Modify: src/models/Task.ts, src/services/task/TaskService.ts, src/screens/TodoList/TodoListScreen.tsx
Subtask Breakdown:
Add tags: string[] to Task.ts.
Update TaskService.ts to filter by tags.
Add TextInput search bar in TodoListScreen.tsx.
Tips: Use react-native-search-bar (install if needed). Test filtering.
Implement Reminders
Description: Add time-based reminders using native APIs.
Files to Read: src/services/task/TaskService.ts, PRD (Section 2.3 for timer integration).
Files to Modify: src/services/task/TaskService.ts, src/screens/TodoList/TodoListScreen.tsx
Subtask Breakdown:
Add reminder: Date to Task.ts.
Use react-native-push-notification to schedule alerts.
Trigger reminders from TaskService.ts on task save.
Tips: Install react-native-push-notification. Handle iOS/Android differences.
Add Jump Start Input
Description: Implement natural language input for due dates.
Files to Read: src/components/task/TaskCard.tsx, src/models/Task.ts.
Files to Modify: src/components/task/TaskCard.tsx, src/services/task/TaskService.ts
Subtask Breakdown:
Add TextInput in TaskCard.tsx for natural input.
Use chrono-node to parse (e.g., "tomorrow at 5pm").
Update TaskService.ts to set dueDate.
Tips: Install chrono-node via npm. Validate input with regex.
Task 5: Prepare for Calendar Integration
Description: Structure data for future Google Calendar integration.
Current Implementation: No calendar integration; tasks lack due dates in Task.ts.
What to Change To: Add due date/time fields for sync readiness.
Subtasks:
Add Calendar Fields
Description: Extend Task.ts with due date fields.
Files to Read: src/models/Task.ts, src/services/task/TaskService.ts.
Files to Modify: src/models/Task.ts, src/services/task/TaskService.ts
Subtask Breakdown:
Add dueDate: Date and dueTime: string to Task.ts.
Update TaskService.ts to handle date-based queries.
Tips: Use ISO format for dates. Install date-fns for manipulations if needed.
Task 6: Maintain Unique Features
Description: Ensure Focus Timer, XP system, and app-blocking remain functional with the new design.
Current Implementation: Integrated via SwipeableTask.tsx, ExperienceService.ts, and AppBlockingService.ts.
What to Change To: No major changes, but adapt to light mode.
Subtasks:
Test Feature Integration
Description: Verify functionality with new UI and views.
Files to Read: src/components/task/SwipeableTask.tsx, src/services/experience/ExperienceService.ts, src/services/blocking/AppBlockingService.ts.
Files to Modify: src/components/task/SwipeableTask.tsx (if needed)
Subtask Breakdown:
Test Focus Timer swipe action.
Verify XP awards (+20/task, +40/North Star).
Ensure app-blocking works in Focus mode.
Tips: Keep fire/water themes subtle in light mode (e.g., background opacity).
General Tips for the Agent
Libraries: Use react-native-vector-icons, react-native-chart-kit, react-native-push-notification, chrono-node (install via npm if missing).
Testing: Leverage jest in jest.config.js (e.g., TodoListScreen.test.tsx).
File Organization: Place new files in matching directories (e.g., src/screens/Projects/).
Error Handling: Add try-catch in service updates (e.g., TaskService.ts).
Performance: Optimize FlatList with initialNumToRender for large lists.