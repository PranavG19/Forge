Task 1: Redesign the Todo List Layout and UI to Match new_home.png
Description
Transform the current todo list layout and UI in TodoListScreen.tsx to match the aesthetic and structure of new_home.png. The new design should feature a light-mode UI with a white background, a fixed Daily North Star header, categorized sections ("Today," "Upcoming," "Someday"), and a clean, minimalistic look with colorful accents inspired by Things3 (blue headers, green North Star, red overdue tasks). The layout should prioritize white space, a column-based structure, and intuitive task organization.

Current Implementation
Layout (Old Structure in old_home.png and TodoListScreen.tsx):
The todo list is displayed in a SafeAreaView with a black background (backgroundColor: colors.background, currently #000000).
Header: A top bar with "Tasks" title (white text) and a "+ New" button (orange, backgroundColor: colors.header, currently #FF5722) on the right.
Intentions Header: Below the top bar, IntentionsHeader.tsx displays the Daily North Star (orange text, color: colors.primary) and weekly intentions (grey text).
Calendar Toggle: A row with "Show Calendar Events" text and a Switch component, styled with flexDirection: 'row', justifyContent: 'space-between'.
Category Tabs: A horizontal row of tabs ("TODAY," "NEXT," "LATER") using TouchableOpacity, styled as buttons with backgroundColor: colors.surface (grey) and backgroundColor: colors.header (orange) when selected.
Task List: A SectionList displaying tasks under the selected category (e.g., "TODAY"), with sections like "TODAY" (header text in grey, color: colors.text.secondary). Tasks are rendered via TaskCard.tsx with a basic layout (white text on black background).
Empty State: If no tasks, a centered message "No tasks in [category]" (grey text).
Spacing: Minimal padding (padding: 20 in container, paddingVertical: spacing.sm in sections), leading to a cluttered look.
Colors:
Background: Black (#000000).
Text: White (colors.text.primary) for primary text, grey (colors.text.secondary) for secondary.
Accents: Orange (#FF5722) for North Star and buttons.
Font: Uses fontFamily: 'System' as a fallback, no specific sans-serif font like Inter.
What Needs to Change
Overall Layout (Target: new_home.png):
Structure: A single-column layout within a SafeAreaView, prioritizing vertical stacking for clarity:
Fixed North Star Header: At the top, a fixed section displaying the Daily North Star (e.g., "Close 1 sales call") in a green box (#50C878), white bold text, pinned to the top with position: 'absolute' or zIndex: 1.
Category Sections: Below the North Star, a SectionList with sections "Today," "Upcoming," and "Someday" (no tabs). Each section has:
Section Header: Bold text (e.g., "Today" in blue, #4A90E2), with an emoji/icon on the left (e.g., calendar for "Today," clock for "Upcoming," music note for "Someday").
Tasks: Tasks under each section, rendered via TaskCard.tsx, with a checkbox on the left, task title in black (#333333), and optional tags/due dates on the right (e.g., "Finance" tag in grey, "Tomorrow" in blue).
Add Task Button: A floating action button (FAB) at the bottom-right, circular, blue (#4A90E2), with a white "+" icon, to navigate to TaskDetails screen for adding a new task.
Spacing: Increase white space for a minimalistic look:
SafeAreaView padding: padding: 24.
Section headers: paddingVertical: 12, paddingHorizontal: 16.
Tasks: marginVertical: 8, padding: 12 for each TaskCard.
Colors (Things3-Inspired):
Background: Light grey (#F5F5F5).
Text: Black (#333333) for primary text, grey (#666666) for secondary (e.g., due dates, tags).
North Star: Green (#50C878), white text inside.
Section Headers: Blue (#4A90E2) for "Today," purple (#A020F0) for "Upcoming," blue (#1E90FF) for "Someday".
Overdue Tasks: Red (#FF4444) for due date text if past due.
FAB: Blue (#4A90E2) with white "+" icon.
Font: Use a sans-serif font, ideally Inter (or fontFamily: 'System' if Inter isn’t available), with fontWeight: 'bold' for headers and fontSize: 16 for task titles.
Remove Elements:
Remove the "Tasks" header and "+ New" button (replace with FAB).
Remove IntentionsHeader.tsx (North Star moves to fixed header).
Remove category tabs ("TODAY," "NEXT," "LATER")—all categories will be shown in a single scrollable list.
Keep the calendar toggle but restyle it to fit the new aesthetic (smaller text, integrated into the "Today" section).
Files to Read for Context
src/screens/TodoList/TodoListScreen.tsx: Current todo list layout, including SectionList, tabs, and IntentionsHeader usage.
src/components/intention/IntentionsHeader.tsx: Current North Star display logic.
src/components/task/TaskCard.tsx: Task rendering component.
src/theme/colors.ts: Current color definitions.
src/theme/spacing.ts: Spacing constants for padding/margins.
pivot.md (Section 3.3 UI Redesign, Task Views): Outlines light mode, color palette, and new category structure.
PRD.md (Section 2.2 Dashboard): Describes the original dark theme layout and functionality.
Files to Modify
src/theme/colors.ts: Update color definitions to match the new palette.
src/screens/TodoList/TodoListScreen.tsx: Redesign the layout, remove tabs, add fixed North Star header, and integrate all categories.
src/components/intention/NorthStarHeader.tsx: Create a new component for the fixed North Star header.
src/components/task/TaskCard.tsx: Update task styling to include checkboxes, tags, and due dates.
Subtasks
1. Update Theme Colors
Description: Revise colors.ts to reflect the new light mode palette inspired by new_home.png.
Subtask Breakdown:
Open src/theme/colors.ts.
Replace background: '#000000' with background: '#F5F5F5'.
Replace primary: '#FF5722' with northStar: '#50C878'.
Update text.primary: '#FFFFFF' to text.primary: '#333333' and text.secondary: '#666666'.
Add new colors: header: '#4A90E2', overdue: '#FF4444', upcoming: '#A020F0', someday: '#1E90FF'.
Add a darkMode object for future toggle: darkMode: { background: '#1C2526', text: '#FFFFFF', border: '#444444' } with a comment: // Variants for future dark mode toggle.
Tips: Ensure all hex codes are in uppercase for consistency (e.g., #F5F5F5).
2. Create a Fixed North Star Header Component
Description: Create a new component NorthStarHeader.tsx to display the Daily North Star in a fixed position at the top, styled as a green box with white text.
Subtask Breakdown:
Create a new file src/components/intention/NorthStarHeader.tsx.
Add the following code:
tsx

Copy
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { intentionService } from '../../services/intention/IntentionService';
import { colors } from '../../theme/colors';

const NorthStarHeader: React.FC = () => {
  const [northStar, setNorthStar] = useState<string | null>(null);

  useEffect(() => {
    const fetchNorthStar = async () => {
      try {
        const northStarData = await intentionService.getDailyNorthStar();
        setNorthStar(northStarData?.title || 'Set Daily North Star');
      } catch (error) {
        console.error('Error fetching North Star:', error);
        setNorthStar('Set Daily North Star');
      }
    };
    fetchNorthStar();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{northStar}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.northStar,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 24,
    marginTop: 12,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System', // Replace with Inter if available
  },
});

export default NorthStarHeader;
Tips: Use position: 'absolute' to pin the header. Ensure marginHorizontal: 24 aligns with the SafeAreaView padding.
3. Redesign the Todo List Layout in TodoListScreen.tsx
Description: Modify TodoListScreen.tsx to remove tabs, integrate all categories ("Today," "Upcoming," "Someday") in a single scrollable list, add the North Star header, and include a floating action button.
Subtask Breakdown:
Open src/screens/TodoList/TodoListScreen.tsx.
Remove Unnecessary Elements:
Remove the header and titleContainer (containing "Tasks" and "+ New").
Remove IntentionsHeader (replaced by NorthStarHeader).
Remove the categoryTabs section (no more "TODAY," "NEXT," "LATER" tabs).
Remove selectedCategory state and related logic (setSelectedCategory, renderCategoryTab).
Update State and Data Fetching:
Modify taskSections to always include all categories:
tsx

Copy
const [taskSections, setTaskSections] = useState<TaskSection[]>([
  { title: 'TODAY', data: [], category: TaskCategory.TODAY },
  { title: 'UPCOMING', data: [], category: TaskCategory.UPCOMING },
  { title: 'SOMEDAY', data: [], category: TaskCategory.SOMEDAY },
]);
Update loadTasks to populate all sections:
tsx

Copy
const loadTasks = async (showLoading = true) => {
  if (showLoading) setLoading(true);
  setError(null);
  try {
    const { today, upcoming, someday } = await taskService.categorizeTasks();
    setTaskSections([
      { title: 'TODAY', data: today, category: TaskCategory.TODAY },
      { title: 'UPCOMING', data: upcoming, category: TaskCategory.UPCOMING },
      { title: 'SOMEDAY', data: someday, category: TaskCategory.SOMEDAY },
    ]);
  } catch (error) {
    console.error('TodoListScreen: Error loading tasks:', error);
    setError('Failed to load tasks. Please try again.');
  } finally {
    setLoading(false);
  }
};
Add North Star Header:
Import and add NorthStarHeader at the top of the SafeAreaView:
tsx

Copy
import NorthStarHeader from '../../components/intention/NorthStarHeader';
tsx

Copy
<SafeAreaView style={styles.container}>
  <NorthStarHeader />
  {/* Rest of the content */}
</SafeAreaView>
Restyle Calendar Toggle:
Move the calendarToggleContainer into the "TODAY" section (rendered via renderSectionHeader when section.title === 'TODAY'):
tsx

Copy
renderSectionHeader={({ section }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderRow}>
      {section.title === 'TODAY' && (
        <Icon name="calendar-today" size={20} color={colors.header} style={styles.sectionIcon} />
      )}
      {section.title === 'UPCOMING' && (
        <Icon name="clock-outline" size={20} color={colors.upcoming} style={styles.sectionIcon} />
      )}
      {section.title === 'SOMEDAY' && (
        <Icon name="music-note" size={20} color={colors.someday} style={styles.sectionIcon} />
      )}
      <Text style={[
        styles.sectionHeaderText,
        section.title === 'TODAY' && { color: colors.header },
        section.title === 'UPCOMING' && { color: colors.upcoming },
        section.title === 'SOMEDAY' && { color: colors.someday },
      ]}>
        {section.title}
      </Text>
    </View>
    {section.title === 'TODAY' && (
      <View style={styles.calendarToggleContainer}>
        <Text style={styles.calendarToggleText}>Show Calendar Events</Text>
        <Switch
          value={showCalendar}
          onValueChange={setShowCalendar}
          trackColor={{ false: colors.surface, true: colors.header }}
          thumbColor={isDarkMode ? colors.darkMode.text.primary : colors.text.primary}
        />
      </View>
    )}
  </View>
)}
Add Floating Action Button (FAB):
Add a FAB at the bottom-right to navigate to the TaskDetails screen for adding a new task:
tsx

Copy
import Icon from 'react-native-vector-icons/MaterialIcons';
tsx

Copy
<TouchableOpacity
  style={styles.fab}
  onPress={() => navigation.navigate('TaskDetails', { taskId: 'new' })}
>
  <Icon name="add" size={24} color="#FFFFFF" />
</TouchableOpacity>
Update Styles:
Replace the styles object in StyleSheet.create with:
tsx

Copy
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24, // Increased for white space
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: section => section.title === 'TODAY' ? 60 : 0, // Space for NorthStarHeader
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System', // Replace with Inter if available
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  calendarToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  calendarToggleText: {
    color: colors.text.primary,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: colors.header,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: colors.status.error + '20', // 20% opacity
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    color: colors.status.error,
    textAlign: 'center',
    fontSize: 14,
  },
});
Tips: Ensure the FAB doesn’t overlap with the SectionList by using position: 'absolute'. Use react-native-vector-icons for the FAB icon (npm install react-native-vector-icons if not installed).
4. Update TaskCard Styling to Match new_home.png
Description: Modify TaskCard.tsx to display tasks with a checkbox, title, tags, and due dates, styled to fit the new aesthetic.
Subtask Breakdown:
Open src/components/task/TaskCard.tsx.
Update the component to include a checkbox, tags, and due dates:
tsx

Copy
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Task } from '../../models/Task';
import { colors } from '../../theme/colors';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (task: Task) => void;
  onStartTimer: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onComplete, onStartTimer }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const dueDateText = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString() === new Date().toLocaleDateString()
      ? 'Today'
      : new Date(task.dueDate).toLocaleDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()
        ? 'Tomorrow'
        : new Date(task.dueDate).toLocaleDateString()
    : null;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(task)}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => onComplete(task)}>
          <Icon
            name={task.completed ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={task.completed ? colors.header : colors.text.secondary}
          />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            task.completed && { textDecorationLine: 'line-through', color: colors.text.secondary },
          ]}>
            {task.title}
          </Text>
          <View style={styles.metaContainer}>
            {task.tags?.length > 0 && (
              <Text style={styles.tag}>{task.tags[0]}</Text>
            )}
            {dueDateText && (
              <Text style={[
                styles.dueDate,
                isOverdue && { color: colors.overdue },
              ]}>
                {dueDateText}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => onStartTimer(task)}>
          <Icon name="timer" size={24} color={colors.header} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'System', // Replace with Inter if available
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tag: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  dueDate: {
    fontSize: 12,
    color: colors.header,
  },
});
Tips: Use react-native-vector-icons for the checkbox and timer icons. Ensure task.tags and task.dueDate are accessible (assumes Task model updates from other tasks).
Task 2: Enhance Task Features for Todo List Display
Description
Enhance the todo list to support tags, due dates, and calendar integration within the "Today" section, ensuring tasks are displayed with the correct metadata as shown in new_home.png.

Current Implementation
Task Model: Task.ts has basic fields (id, title, category, subtasks, completed), but lacks tags and dueDate.
Task Display: TaskCard.tsx (pre-update) only shows the task title and a completion toggle, no tags or due dates.
Calendar: CalendarEvents.tsx is conditionally rendered when showCalendar is true, but not integrated into task categorization.
Data Fetching: TaskService.ts’s categorizeTasks returns tasks in today, upcoming, someday based on basic TaskCategory, not fully leveraging dueDate.
What Needs to Change
Task Model: Add tags: string[] and dueDate: Date to Task.ts to support metadata display.
Task Categorization: Update TaskService.ts to categorize tasks using dueDate and integrate calendar events into the "Today" section.
Task Display: Already updated in Task 1, but ensure TaskCard.tsx uses the new fields (tags, dueDate).
Files to Read for Context
src/models/Task.ts: Current task model.
src/services/task/TaskService.ts: Task categorization logic.
src/components/calendar/CalendarEvents.tsx: Calendar event rendering.
pivot.md (Section 3.3 Feature Enhancements, Data Preparation): Details on tags, due dates, and calendar readiness.
Files to Modify
src/models/Task.ts: Add tags and dueDate.
src/services/task/TaskService.ts: Update categorization to use dueDate and integrate calendar events.
src/screens/TodoList/TodoListScreen.tsx: Ensure calendar events are integrated into "Today".
Subtasks
1. Update Task Model
Description: Add tags and dueDate to Task.ts.
Subtask Breakdown:
Open src/models/Task.ts.
Update the Task interface:
tsx

Copy
export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  subtasks?: Subtask[];
  completed?: boolean;
  tags?: string[];
  dueDate?: Date;
}
Ensure TaskCategory enum aligns with new categories:
tsx

Copy
export enum TaskCategory {
  TODAY = 'TODAY',
  UPCOMING = 'UPCOMING',
  SOMEDAY = 'SOMEDAY',
}
Tips: Use Date type for dueDate and store in ISO format (e.g., new Date().toISOString()).
2. Enhance Task Categorization
Description: Update TaskService.ts to categorize tasks using dueDate and integrate calendar events.
Subtask Breakdown:
Open src/services/task/TaskService.ts.
Update categorizeTasks to use dueDate:
tsx

Copy
async categorizeTasks(): Promise<{ today: Task[]; upcoming: Task[]; someday: Task[] }> {
  const tasks = await this.getTasks(); // Assumes getTasks fetches from database
  const today = [];
  const upcoming = [];
  const someday = [];

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(todayDate);
  sevenDaysFromNow.setDate(todayDate.getDate() + 7);

  for (const task of tasks) {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate.getTime() === todayDate.getTime()) {
        today.push(task);
      } else if (dueDate > todayDate && dueDate <= sevenDaysFromNow) {
        upcoming.push(task);
      } else {
        someday.push(task);
      }
    } else {
      someday.push(task);
    }
  }

  return { today, upcoming, someday };
}
Tips: Install date-fns (npm install date-fns) if date manipulation becomes complex. Ensure dueDate comparisons are timezone-aware.
3. Integrate Calendar Events into "Today" Section
Description: Ensure CalendarEvents.tsx renders within the "Today" section when showCalendar is true.
Subtask Breakdown:
In TodoListScreen.tsx, the integration is already handled in the renderSectionHeader for "TODAY" (Task 1, Step 3). Ensure the renderItem for "TODAY" includes calendar events:
tsx

Copy
renderItem={({ item, section }) => (
  section.title === 'TODAY' && showCalendar && item.isCalendarEvent ? (
    <CalendarEvents />
  ) : (
    <TaskCard
      task={item}
      onPress={handleTaskPress}
      onComplete={handleTaskComplete}
      onStartTimer={task => {
        navigation.navigate('Timer', { taskId: task.id });
      }}
    />
  )
)}
Update TaskService.ts to flag calendar events in today (mock implementation for now):
tsx

Copy
async categorizeTasks(): Promise<{ today: Task[]; upcoming: Task[]; someday: Task[] }> {
  const tasks = await this.getTasks();
  const today = [];
  const upcoming = [];
  const someday = [];

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(todayDate);
  sevenDaysFromNow.setDate(todayDate.getDate() + 7);

  for (const task of tasks) {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate.getTime() === todayDate.getTime()) {
        today.push(task);
      } else if (dueDate > todayDate && dueDate <= sevenDaysFromNow) {
        upcoming.push(task);
      } else {
        someday.push(task);
      }
    } else {
      someday.push(task);
    }
  }

  // Mock calendar events integration
  if (today.length > 0) {
    today.push({ id: 'calendar-placeholder', title: 'Calendar Events', isCalendarEvent: true });
  }

  return { today, upcoming, someday };
}
Tips: Use a placeholder for CalendarEvents until full integration is implemented. Ensure isCalendarEvent flag doesn’t interfere with task rendering.
General Tips for the Agent
Libraries:
react-native-vector-icons: For icons in TaskCard and FAB (npm install react-native-vector-icons).
date-fns: For date manipulation in TaskService.ts (npm install date-fns).
File Organization: Ensure new files like NorthStarHeader.tsx are placed in src/components/intention/.
Error Handling: Wrap service calls (e.g., intentionService.getDailyNorthStar, taskService.categorizeTasks) in try-catch to handle failures gracefully.
Performance: Optimize SectionList with keyExtractor (already present) and initialNumToRender: 10 for large task lists:
tsx

Copy
<SectionList
  sections={taskSections}
  keyExtractor={item => item.id}
  renderItem={renderItem}
  renderSectionHeader={renderSectionHeader}
  contentContainerStyle={styles.listContent}
  ListEmptyComponent={renderEmptyList}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.header}
    />
  }
  stickySectionHeadersEnabled={true}
  initialNumToRender={10}
/>
