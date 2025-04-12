# Remaining Implementation Plan for Monk Mode: Forge

This implementation plan covers the remaining features needed to complete the Forge app according to the PRD. Each step is self-contained with clear context about what exists and what needs to be added.

## Sound System Implementation

### Step 1: Add Sound Assets and Integration

Context:
Done: FeedbackService.ts exists with sound playback logic
Not Done: Sound files missing, no actual sound integration

Files to Create:
src/assets/sounds/timer-start.mp3
src/assets/sounds/timer-end.mp3
src/assets/sounds/task-complete.mp3
src/assets/sounds/level-up.mp3

Files to Modify:
src/services/feedback/FeedbackService.ts

Instructions:

1. Add sound files to assets directory (under 100KB each)
2. Update FeedbackService.ts to properly load and cache sounds
3. Add volume normalization across all sounds
4. Implement error handling for failed sound loading

## App Blocking System

### Step 1: iOS Screen Time Integration

Context:
Done: Basic app structure exists
Not Done: No iOS app blocking implementation

Files to Create:

```swift
ios/Forge/BlockingManager.swift
ios/Forge/BlockingManager.m
```

Instructions:

1. Implement Screen Time API integration
2. Add permission request handling
3. Create methods for all three blocking modes
4. Add breach attempt logging

### Step 2: Android Usage Stats Integration

Context:
Done: Basic app structure exists
Not Done: No Android app blocking implementation

Files to Create:

```java
android/app/src/main/java/com/forge/blocking/BlockingManager.java
android/app/src/main/java/com/forge/blocking/BlockingService.java
```

Instructions:

1. Implement UsageStatsManager integration
2. Add permission handling
3. Create foreground service for monitoring
4. Add breach attempt logging

### Step 3: Blocking UI Implementation

Context:
Done: Basic settings UI exists
Not Done: No app blocking configuration UI

Files to Create:
src/components/blocking/BlockingConfig.tsx
src/components/blocking/AppSelector.tsx

Files to Modify:
src/screens/Profile/ProfileScreen.tsx

Instructions:

1. Create UI for selecting apps to block
2. Add mode selection (Full/Reminder/Timer)
3. Implement timer duration configuration
4. Add separate configurations for Focus/Rest modes

## Weekly Reset System

### Step 1: Reset Infrastructure

Context:
Done: Basic settings for reset day exist
Not Done: No reset implementation

Files to Create:
src/services/reset/WeeklyResetService.ts
src/components/modals/WeeklyResetModal.tsx

Instructions:

1. Create service to track reset schedule
2. Implement reset check on app launch
3. Add data archiving functionality
4. Create reset notification system

### Step 2: Reset UI Flow

Context:
Done: Basic intention setting exists
Not Done: No reset UI flow

Files to Modify:
src/screens/TodoList/TodoListScreen.tsx
App.tsx

Instructions:

1. Add reset day detection
2. Implement reset modal flow
3. Create weekly review UI
4. Add reset confirmation dialog

## Experience System

### Step 1: Core Experience Logic

Context:
Done: Basic ExperienceService.ts exists
Not Done: No XP calculation or level system

Files to Modify:
src/services/experience/ExperienceService.ts
src/services/task/TaskService.ts
src/services/timer/TimerService.ts

Instructions:

1. Implement XP calculation:
   - +10 XP per focus hour
   - +20 XP per task
   - 2x multiplier for North Star tasks
2. Add level progression system
3. Create XP event logging
4. Implement weekly XP reset

### Step 2: Experience UI

Context:
Done: Basic ExperienceBar.tsx exists
Not Done: No full experience visualization

Files to Create:
src/components/experience/LevelUpModal.tsx
src/components/experience/ExperienceStats.tsx

Files to Modify:
src/components/experience/ExperienceBar.tsx
src/screens/Profile/ProfileScreen.tsx

Instructions:

1. Enhance progress bar visualization
2. Add level-up animation
3. Create detailed stats view
4. Implement XP history tracking

## Enhanced Timer Animations

### Step 1: Focus Mode Fire Animation

Context:
Done: Basic FlameAnimation.tsx exists
Not Done: No advanced fire effects

Files to Create:
src/components/animation/FireParticle.tsx
src/utils/animation/particleSystem.ts

Files to Modify:
src/components/animation/FlameAnimation.tsx

Instructions:

1. Implement particle system for flames
2. Add dynamic color gradients
3. Create wind effect simulation
4. Optimize performance

### Step 2: Rest Mode Water Animation

Context:
Done: Basic WaveAnimation.tsx exists
Not Done: No advanced water effects

Files to Create:
src/components/animation/WaterParticle.tsx
src/utils/animation/fluidDynamics.ts

Files to Modify:
src/components/animation/WaveAnimation.tsx

Instructions:

1. Implement fluid dynamics simulation
2. Add ripple effects
3. Create depth perception
4. Optimize performance

## Task Management Enhancements

### Step 1: Collapsible Categories

Context:
Done: Basic task list exists
Not Done: No collapsible sections

Files to Create:
src/components/task/TaskSection.tsx

Files to Modify:
src/screens/TodoList/TodoListScreen.tsx

Instructions:

1. Implement collapsible section component
2. Add animation for expand/collapse
3. Create persistent state for section visibility
4. Add drag-and-drop between sections

### Step 2: Enhanced Subtask System

Context:
Done: Basic subtask support exists
Not Done: No advanced subtask features

Files to Create:
src/components/task/SubtaskList.tsx
src/components/task/SubtaskProgress.tsx

Files to Modify:
src/screens/TaskDetails/TaskDetailsScreen.tsx
src/services/task/TaskService.ts

Instructions:

1. Implement subtask progress visualization
2. Add subtask reordering
3. Create time tracking per subtask
4. Add subtask completion animations

### Step 3: Swipe Actions

Context:
Done: Basic TaskCard.tsx exists
Not Done: No swipe gestures

Files to Create:
src/components/task/SwipeableTask.tsx

Files to Modify:
src/components/task/TaskCard.tsx

Instructions:

1. Implement swipe gesture detection
2. Add swipe-to-timer action
3. Create swipe animation
4. Add haptic feedback

## Calendar Integration

### Step 1: Google Calendar Integration

Context:
Done: CalendarEvents.tsx exists with mock data
Not Done: No actual calendar integration

Files to Create:
src/services/calendar/GoogleCalendarService.ts
src/utils/calendar/calendarAuth.ts

Files to Modify:
src/services/calendar/CalendarService.ts
src/components/calendar/CalendarEvents.tsx

Instructions:

1. Implement Google Calendar API client
2. Add OAuth flow
3. Create event fetching logic
4. Implement event caching

## Stats System

### Step 1: Enhanced Analytics

Context:
Done: Basic analytics exist
Not Done: No comprehensive stats tracking

Files to Create:
src/services/analytics/StatsAggregator.ts
src/components/stats/StatsVisualizer.tsx

Files to Modify:
src/services/analytics/AnalyticsService.ts
src/screens/Profile/ProfileScreen.tsx

Instructions:

1. Implement comprehensive stat tracking:
   - Focus/Rest time aggregation
   - Breach attempt logging
   - Task completion rates
2. Add data visualization
3. Create weekly/monthly reports
4. Implement trend analysis

## Testing and Polish

### Step 1: Automated Testing

Context:
Done: Basic Jest setup exists
Not Done: No comprehensive tests

Files to Create:
src/**tests**/services/_
src/**tests**/components/_

Instructions:

1. Add unit tests for all services
2. Create component render tests
3. Implement integration tests
4. Add performance benchmarks

### Step 2: Final Polish

Context:
Done: Basic app functionality
Not Done: No final polish

Files to Modify:
All relevant files

Instructions:

1. Audit and optimize performance
2. Enhance error handling
3. Add loading states
4. Implement proper cleanup

## Implementation Order

Priority order for implementation:

1. Sound System (Core feedback)
2. App Blocking (Core functionality)
3. Weekly Reset (Core user flow)
4. Experience System (User engagement)
5. Enhanced Timer Animations (User experience)
6. Task Management Enhancements (Usability)
7. Stats System (User insights)
8. Calendar Integration (Nice to have)
9. Testing and Polish (Quality assurance)

Each step should be completed and tested before moving to the next. Regular commits and PR reviews recommended.
