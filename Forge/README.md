# Monk Mode: Forge

A mobile app designed for individuals in "Monk Mode"—a protocol of extreme focus and discipline, committing 100% to their goals. Forge bridges the gap between **agency** (the power to act decisively) and **intentionality** (clarity of purpose) with a brutal, honest approach.

## Features

### 1. Intention-Setting

- Daily "North Star" intention setting (one win for the day)
- Weekly intentions (3 goals, 1 North Star)
- Cycling suggestions for quick inspiration

### 2. Task Management

- Priority-based to-do list organized by Today, Next, and Later
- North Star task highlighting
- Subtasks with progress tracking
- Task details with notes and time estimates

### 3. Focus Timer

- Task-linked timer with Focus and Rest modes
- Stunning visuals: fire animation (Focus) and water animation (Rest)
- Customizable timer presets (25/5, 90/30, 50/10)
- App blocking to eliminate distractions

### 4. Profile & Analytics

- Weekly stats (Focus hours, Rest hours, Distraction breaches)
- Task completion tracking
- Experience system with level progression
- Settings for customization

## Getting Started

### Prerequisites

- Node.js 16+
- React Native development environment
- iOS: XCode 13+ (Mac only)
- Android: Android Studio with SDK 30+

### Installation

1. Clone the repository

```sh
git clone https://github.com/yourusername/forge.git
cd forge
```

2. Install dependencies

```sh
npm install
```

3. iOS Setup (Mac only)

```sh
bundle install
bundle exec pod install --project-directory=ios
```

4. Run the app

```sh
# iOS
npm run ios

# Android
npm run android
```

## App Structure

- `src/components/`: Reusable UI components
- `src/screens/`: Main app screens
- `src/services/`: Business logic and data services
- `src/models/`: Data models and types
- `src/theme/`: UI theme configuration

## Key Services

- **IntentionService**: Manages daily and weekly intentions
- **TaskService**: Handles task CRUD operations
- **TimerService**: Controls focus/rest timers
- **AppBlockingService**: Manages app blocking during focus sessions
- **ExperienceService**: Tracks user progress and experience
- **AnalyticsService**: Collects usage metrics

## Development

### Running Tests

```sh
npm test
```

### Building for Production

```sh
# iOS
npm run build:ios

# Android
npm run build:android
```

## Design Philosophy

Forge follows a "brutal, focused, minimalistic" design ethos:

- **Black base** with orange (North Star) and grey (regular tasks)
- **Fire animation** for Focus mode
- **Water animation** for Rest mode
- **Minimal UI** with only essential elements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

_"This is your vow. Forge it."_
