Expanded Implementation Plan for Monk Mode: Forge
This plan outlines the remaining features needed to complete the "Monk Mode: Forge" app, a productivity tool with local functionality (no cloud). Each step includes detailed context about the current codebase, specific instructions, and clear success criteria.

Sound System Implementation
Step 1: Add Sound Assets and Integration
Context:

Done: src/services/feedback/FeedbackService.ts exists with sound playback logic using react-native-sound.
Not Done: Sound files are missing, and integration isn’t fully functional (e.g., no caching or error handling).
Files to Create:

src/assets/sounds/timer-start.mp3
src/assets/sounds/timer-end.mp3
src/assets/sounds/task-complete.mp3
src/assets/sounds/level-up.mp3
Files to Modify:

src/services/feedback/FeedbackService.ts
Files to Read for Context:

src/services/feedback/FeedbackService.ts (current sound playback logic)
src/types/react-native-sound.d.ts (sound typings, if available)
Instructions:

Add Sound Files:
Create the src/assets/sounds/ directory if it doesn’t exist.
Add the four sound files, ensuring each is under 100KB and optimized for mobile playback (e.g., MP3, 44.1kHz, mono).
Update FeedbackService.ts:
Load and cache sound files using react-native-sound to avoid reloading on each play.
Normalize volume across all sounds for consistency (e.g., set volume to 0.8).
Add error handling for loading or playback failures.
Example implementation:
typescript

Collapse

Wrap

Copy
import Sound from 'react-native-sound';

class FeedbackService {
  private sounds: { [key: string]: Sound } = {};

  constructor() {
    Sound.setCategory('Playback'); // Allow sound in silent mode
    this.loadSounds();
  }

  private loadSounds() {
    const soundFiles = ['timer-start', 'timer-end', 'task-complete', 'level-up'];
    soundFiles.forEach((file) => {
      const sound = new Sound(`${file}.mp3`, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error(`Failed to load sound: ${file}`, error);
          return;
        }
        sound.setVolume(0.8); // Normalize volume
        this.sounds[file] = sound;
      });
    });
  }

  public playSound(soundName: string) {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.play((success) => {
        if (!success) {
          console.error(`Failed to play sound: ${soundName}`);
        }
      });
    }
  }
}

export default new FeedbackService();
Tips:

Use short, distinct sound clips to avoid overlap during rapid triggers.
Test on both iOS and Android to ensure compatibility with react-native-sound.
Success Criteria:

All four sounds load without errors and play when triggered via FeedbackService.
Volume is consistent across all sounds, audible even in silent mode.
App Blocking System
Step 1: iOS Screen Time Integration
Context:

Done: Basic app structure exists (e.g., React Native setup, navigation).
Not Done: No iOS-specific app blocking implementation using the Screen Time API.
Files to Create:

ios/Forge/BlockingManager.swift
ios/Forge/BlockingManager.m (Objective-C bridge file)
Files to Modify:

src/services/settings/SettingsService.ts (to store blocking preferences)
Files to Read for Context:

src/services/settings/SettingsService.ts (current settings management)
Instructions:

Implement Screen Time API:
In BlockingManager.swift, use the FamilyControls framework to block apps based on user-selected settings.
Request Screen Time authorization from the user.
Support three blocking modes: Full (complete block), Reminder (warnings), and Timer (block for a duration).
Log breach attempts when blocked apps are accessed.
Example:
swift

Collapse

Wrap

Copy
import FamilyControls

@objc(BlockingManager)
class BlockingManager: NSObject {
  @objc func requestAuthorization(completion: @escaping (Bool) -> Void) {
    let center = FamilyControlsCenter.shared
    center.requestAuthorization { result in
      switch result {
      case .success: completion(true)
      case .failure(let error):
        print("Authorization failed: \(error)")
        completion(false)
      }
    }
  }

  @objc func blockApps(_ apps: [String], mode: String) {
    // Implement blocking logic based on mode
  }
}
Bridge to React Native:
In BlockingManager.m, expose Swift methods to JavaScript via React Native’s native module system.
Tips:

Requires iOS 14+; add a fallback message for older versions.
Test permission flow thoroughly, as users may deny access.
Success Criteria:

Users can grant Screen Time permission.
Apps are blocked according to the selected mode.
Breach attempts are logged in the console.
Step 2: Android Usage Stats Integration
Context:

Done: Basic app structure exists.
Not Done: No Android-specific app blocking using UsageStatsManager.
Files to Create:

android/app/src/main/java/com/forge/blocking/BlockingManager.java
android/app/src/main/java/com/forge/blocking/BlockingService.java
Files to Modify:

src/services/settings/SettingsService.ts (to store blocking preferences)
Files to Read for Context:

src/services/settings/SettingsService.ts (current settings)
Instructions:

Implement Usage Stats Monitoring:
In BlockingManager.java, request PACKAGE_USAGE_STATS permission and monitor app usage.
In BlockingService.java, create a foreground service to enforce blocking rules.
Support Full, Reminder, and Timer modes; log breaches when blocked apps are opened.
Example:
java

Collapse

Wrap

Copy
public class BlockingManager {
  private Context context;

  public BlockingManager(Context context) {
    this.context = context;
  }

  public void requestUsagePermission(Activity activity) {
    Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
    activity.startActivity(intent);
  }

  public void blockApps(List<String> apps, String mode) {
    // Start BlockingService with apps and mode
  }
}
Tips:

Add a notification for the foreground service to comply with Android requirements.
Check permission status before attempting to block.
Success Criteria:

Users can grant usage stats permission.
Apps are monitored/blocked per the selected mode.
Breach attempts are logged.
Step 3: Blocking UI Implementation
Context:

Done: Basic settings UI exists in ProfileScreen.tsx.
Not Done: No UI for configuring app blocking.
Files to Create:

src/components/blocking/BlockingConfig.tsx
src/components/blocking/AppSelector.tsx
Files to Modify:

src/screens/Profile/ProfileScreen.tsx
Files to Read for Context:

src/services/settings/SettingsService.ts (settings storage)
Instructions:

Create Blocking UI:
In BlockingConfig.tsx, build a UI for selecting blocking mode (Full, Reminder, Timer) and setting a duration for Timer mode.
In AppSelector.tsx, list installed apps and allow selection for Focus and Rest modes separately.
Integrate into ProfileScreen.tsx:
tsx

Collapse

Wrap

Copy
import BlockingConfig from '../components/blocking/BlockingConfig';
import AppSelector from '../components/blocking/AppSelector';

const ProfileScreen = () => {
  return (
    <View>
      <BlockingConfig />
      <AppSelector mode="Focus" />
      <AppSelector mode="Rest" />
    </View>
  );
};
Tips:

Use react-native-modal for app selection to keep the UI clean.
Persist selections in SettingsService.ts using AsyncStorage.
Success Criteria:

Users can configure blocking modes and select apps for Focus/Rest.
Settings are saved and applied correctly.
Weekly Reset System
Step 1: Reset Infrastructure
Context:

Done: Reset day setting exists in SettingsService.ts.
Not Done: No reset logic or data archiving.
Files to Create:

src/services/reset/WeeklyResetService.ts
src/components/modals/WeeklyResetModal.tsx
Files to Modify:

App.tsx (to trigger reset check)
Files to Read for Context:

src/services/settings/SettingsService.ts (reset day setting)
src/services/intention/IntentionService.ts (intention data)
Instructions:

Implement Reset Logic:
In WeeklyResetService.ts, check if today matches the reset day and archive old data (e.g., completed tasks).
Trigger a reset notification or modal.
Example:
typescript

Collapse

Wrap

Copy
class WeeklyResetService {
  public checkForReset(): boolean {
    const resetDay = SettingsService.getResetDay(); // e.g., 0 = Sunday
    const today = new Date().getDay();
    if (today === resetDay) {
      // Archive data and return true
      return true;
    }
    return false;
  }
}
Create Reset Modal:
In WeeklyResetModal.tsx, prompt the user to set new weekly intentions (three intentions + North Star).
Tips:

Store the last reset date in AsyncStorage to prevent multiple triggers on the same day.
Keep archived data lightweight (e.g., JSON summary).
Success Criteria:

Reset triggers on the correct day.
Old data is archived, and the reset modal appears.
Step 2: Reset UI Flow
Context:

Done: Basic intention setting exists in OnboardingScreen.tsx.
Not Done: No reset-specific UI flow or weekly review.
Files to Modify:

src/screens/TodoList/TodoListScreen.tsx
App.tsx
Files to Read for Context:

src/services/reset/WeeklyResetService.ts (reset logic)
Instructions:

Trigger Reset in App.tsx:
Check WeeklyResetService.checkForReset() on launch and show WeeklyResetModal.tsx if needed.
Add Weekly Review in TodoListScreen.tsx:
Display a summary of last week’s progress (e.g., tasks completed, focus time).
Tips:

Use react-native-modal for the reset modal; make it non-dismissible until intentions are set.
Keep the weekly review simple (e.g., text stats).
Success Criteria:

Reset modal appears on reset day.
Weekly review shows accurate past-week stats.
Experience System
Step 1: Core Experience Logic
Context:

Done: ExperienceService.ts exists with basic structure.
Not Done: No XP calculation or leveling.
Files to Modify:

src/services/experience/ExperienceService.ts
src/services/task/TaskService.ts
src/services/timer/TimerService.ts
Files to Read for Context:

src/models/Task.ts (task structure)
Instructions:

Implement XP System:
In ExperienceService.ts, add:
+10 XP per focus hour.
+20 XP per completed task.
2x multiplier for North Star tasks.
Level up every 100 XP.
Example:
typescript

Collapse

Wrap

Copy
class ExperienceService {
  private xp = 0;

  public addXP(amount: number, isNorthStar: boolean = false) {
    this.xp += isNorthStar ? amount * 2 : amount;
    // Check for level up
  }

  public getLevel(): number {
    return Math.floor(this.xp / 100) + 1;
  }
}
Integrate with Services:
Call addXP from TaskService.ts on task completion and TimerService.ts on focus hour completion.
Tips:

Store XP in AsyncStorage for persistence.
Check PRD for weekly XP reset requirements.
Success Criteria:

XP accumulates correctly from tasks and timer.
Levels increase at 100 XP intervals.
Step 2: Experience UI
Context:

Done: ExperienceBar.tsx exists with basic UI.
Not Done: No detailed visualization or animations.
Files to Create:

src/components/experience/LevelUpModal.tsx
src/components/experience/ExperienceStats.tsx
Files to Modify:

src/components/experience/ExperienceBar.tsx
src/screens/Profile/ProfileScreen.tsx
Instructions:

Enhance ExperienceBar.tsx:
Show current XP, level, and a progress bar.
Create LevelUpModal.tsx:
Display new level on level-up with a simple animation.
Add Stats in ProfileScreen.tsx:
Include ExperienceStats.tsx for XP history.
Tips:

Use react-native-reanimated for animations.
Keep stats minimal (e.g., total XP, levels gained).
Success Criteria:

Experience bar reflects XP and level.
Level-up modal appears with animation.
Stats are visible in the profile.
Enhanced Timer Animations
Step 1: Focus Mode Fire Animation
Context:

Done: FlameAnimation.tsx exists with basic visuals.
Not Done: No advanced particle effects.
Files to Create:

src/components/animation/FireParticle.tsx
src/utils/animation/particleSystem.ts
Files to Modify:

src/components/animation/FlameAnimation.tsx
Instructions:

Add Particle Effects:
In particleSystem.ts, generate fire particles with random movement.
In FireParticle.tsx, render particles with color gradients (red/orange).
Update FlameAnimation.tsx to use the particle system.
Tips:

Limit particles (e.g., 20-30) for mobile performance.
Use react-native-reanimated for smooth animation.
Success Criteria:

Fire animation looks dynamic and runs smoothly.
Step 2: Rest Mode Water Animation
Context:

Done: WaveAnimation.tsx exists with basic visuals.
Not Done: No fluid effects.
Files to Create:

src/components/animation/WaterParticle.tsx
src/utils/animation/fluidDynamics.ts
Files to Modify:

src/components/animation/WaveAnimation.tsx
Instructions:

Add Fluid Effects:
In fluidDynamics.ts, simulate basic water ripples.
In WaterParticle.tsx, render water particles with blue gradients.
Update WaveAnimation.tsx with fluid dynamics.
Tips:

Simplify fluid simulation for performance.
Use react-native-reanimated for animation.
Success Criteria:

Water animation looks fluid and performs well.
Task Management Enhancements
Step 1: Collapsible Categories
Context:

Done: Task list exists in TodoListScreen.tsx.
Not Done: No collapsible sections.
Files to Create:

src/components/task/TaskSection.tsx
Files to Modify:

src/screens/TodoList/TodoListScreen.tsx
Instructions:

Implement Collapsible Sections:
In TaskSection.tsx, create collapsible sections for "Today," "Next," "Later."
Add drag-and-drop support with react-native-gesture-handler.
Tips:

Use react-native-collapsible for smooth expand/collapse.
Store section state in SettingsService.ts.
Success Criteria:

Sections collapse/expand with animation.
Tasks can be dragged between sections.
Step 2: Enhanced Subtask System
Context:

Done: Basic subtasks exist in TaskDetailsScreen.tsx.
Not Done: No reordering or time tracking.
Files to Create:

src/components/task/SubtaskList.tsx
src/components/task/SubtaskProgress.tsx
Files to Modify:

src/screens/TaskDetails/TaskDetailsScreen.tsx
src/services/task/TaskService.ts
Instructions:

Enhance Subtasks:
In SubtaskList.tsx, enable reordering with react-native-draggable-flatlist.
In SubtaskProgress.tsx, show completion progress.
Update TaskService.ts for subtask time tracking.
Tips:

Use react-native-reanimated for completion animations.
Keep time tracking simple (e.g., total minutes).
Success Criteria:

Subtasks can be reordered.
Progress and time tracking are visible.
Step 3: Swipe Actions
Context:

Done: TaskCard.tsx exists.
Not Done: No swipe gestures.
Files to Create:

src/components/task/SwipeableTask.tsx
Files to Modify:

src/components/task/TaskCard.tsx
Instructions:

Add Swipe Gestures:
In SwipeableTask.tsx, use react-native-gesture-handler to detect swipe-right for timer start.
Add haptic feedback with react-native-haptic-feedback.
Tips:

Ensure swipes don’t interfere with other gestures.
Test haptic feedback on both platforms.
Success Criteria:

Swipe-right starts the timer.
Haptic feedback confirms the action.
Calendar Integration
Step 1: Google Calendar Integration
Context:

Done: CalendarEvents.tsx exists with mock data.
Not Done: No real calendar integration.
Files to Create:

src/services/calendar/GoogleCalendarService.ts
src/utils/calendar/calendarAuth.ts
Files to Modify:

src/services/calendar/CalendarService.ts
src/components/calendar/CalendarEvents.tsx
Instructions:

Integrate Google Calendar:
In calendarAuth.ts, handle OAuth with react-native-app-auth.
In GoogleCalendarService.ts, fetch events via Google Calendar API.
Update CalendarService.ts and CalendarEvents.tsx with real data.
Tips:

Cache events in AsyncStorage to reduce API calls.
Test OAuth flow on physical devices.
Success Criteria:

Users can authenticate with Google Calendar.
Real events display in the app.
Stats System
Step 1: Enhanced Analytics
Context:

Done: Basic analytics in AnalyticsService.ts.
Not Done: No detailed stats tracking.
Files to Create:

src/services/analytics/StatsAggregator.ts
src/components/stats/StatsVisualizer.tsx
Files to Modify:

src/services/analytics/AnalyticsService.ts
src/screens/Profile/ProfileScreen.tsx
Instructions:

Enhance Stats:
In StatsAggregator.ts, track Focus/Rest time, breaches, and task completion rates.
In StatsVisualizer.tsx, use react-native-chart-kit for charts.
Update AnalyticsService.ts and add to ProfileScreen.tsx.
Tips:

Focus on weekly stats for simplicity.
Ensure visualizations are mobile-friendly.
Success Criteria:

Detailed stats (e.g., focus time, breaches) are tracked.
Charts display clearly in the profile.
Implementation Order
Priority Order:

Sound System (Immediate user feedback)
App Blocking (Core feature)
Weekly Reset (User flow foundation)
Experience System (Engagement)
Enhanced Timer Animations (Visual appeal)
Task Management Enhancements (Usability)
Stats System (Insights)
Calendar Integration (Optional enhancement)
Complete each step fully before proceeding to the next, committing changes regularly for review. This ensures a stable build-up to launch.