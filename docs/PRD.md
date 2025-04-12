### Product Requirements Document (PRD)

#### **Forge**

**Version**: 1.0 (Initial Release)
**Date**: April 11, 2025
**Prepared by**: [Your Name] with Grok 3 (xAI)

---

### **1. Overview**

#### **1.1 Purpose**

**Forge** is a mobile app designed for individuals in "Monk Mode"—a protocol of extreme focus and discipline, committing 100% to their goals. It bridges the gap between **agency** (the power to act decisively and shape outcomes) and **intentionality** (clarity of purpose guiding actions) with a brutal, honest approach. Unlike generalist productivity apps (e.g., Notion, Todoist), Forge is niche, targeting users who demand relentless execution aligned with a singular purpose, free of distractions and fluff. It integrates seamlessly into existing workflows, requiring minimal input outside of setting intentions and reviewing feedback.

#### **1.2 Target Audience**

**Who**: Entrepreneurs, students, creators (ages 20-40, tech-savvy) in "all in" phases—e.g., scaling startups (Hormozi fans), crushing exams (Abdaal fans).
**Needs**: Clarity ("What’s my win?"), action ("How do I crush it?"), feedback ("Am I on track?").
**Size**: Initial goal of 10K users in 6 months via organic growth (X, Reddit r/productivity).

#### **1.3 Value Proposition**

**Core Problem**: Productivity apps often prioritize action (agency) without purpose (intentionality) or drown users in reflection, stalling progress. Monk Mode users need a tool to align relentless action with clear intent, avoiding traps like distractions, doubts, and overthinking.
**Solution**: Forge offers a lean, visually stunning app with:
Daily/weekly "North Star" intentions to guide focus.
A task-linked timer (Focus/Rest modes) to drive agency.
App-blocking to eliminate distractions.
Brutal feedback (time stats, breach attempts) to ensure alignment.
**Differentiation**: Unlike Notion’s flexibility, Todoist’s breadth, or Forest’s playfulness, Forge is purpose-built for Monk Mode—brutal, simple, and intense.

#### **1.4 Release Scope**

**Initial Release**: Single-tier (free), local-only app—no cloud sync, no authentication, no premium separation. Premium features (e.g., sync) deferred to post-MVP based on user feedback.
**Development Approach**: Built via no-code platform CursorAI, supervised by an experienced software developer for minimal custom code (e.g., OS API hooks). Focus on speed and simplicity.

---

### **2. Features**

#### **2.1 Intention-Setting**

**Description**: Users set a daily "North Star" (one win) and weekly intentions (3 goals, 1 North Star) to anchor agency in purpose.
**Details**:
**Daily**: Prompt: “What’s the one win you want today?” (1-2 min).
**Weekly**: Prompt: “Set 3 intentions—1 North Star” (5-10 min, user-defined reset day, e.g., Sunday).
**Input**: Single text box with cycling greyed-out suggestions (3s interval, tap to cycle):
**Daily Examples**: “Close 1 sales call,” “Record 1 YouTube script,” “Outline $10K offer,” “Meditate 20 min.”
**Weekly Examples**: “Launch side hustle landing page,” “Batch 5 blog posts,” “Pitch 10 clients,” “Hit 5 gym sessions.”
**First Login**: Sets daily + weekly intentions + reset day.
**Purpose**: Ensures intentionality without overthinking, inspired by Hormozi’s outcome clarity and Abdaal’s value-driven focus.
**UX**: Text box, “Done” button, orange glow for North Star.

#### **2.2 Dashboard (To-Do List)**

**Description**: A priority-based to-do list (GTD-inspired) displaying intentions and tasks, integrated with the Focus Timer.
**Details**:
**Top Bar**:
Daily North Star: e.g., “Close 1 sales call” (orange, bold).
Weekly Intentions: e.g., “Launch landing page (North Star),” “Batch 5 posts,” “Pitch 10 clients” (grey).
**List**:
Categories: “Today,” “Next,” “Later” (collapsible).
Tasks: e.g., “Call Client A,” “Draft Pitch” (North Star-tagged glow orange).
Subtasks: e.g., “Prep notes,” “Dial” (collapse under parent).
Swipe Right: “Start Timer” (links to Focus Timer).
Checkmark: Completes task (exp +20, +40 for North Star).
**Task Details (Tap Task)**:
Time: “Focus: 25 min, Rest: 5 min.”
Subtasks: “Prep notes (10 min), Dial (15 min).”
Progress Bar: % complete (e.g., “2/3 = 66%”).
Notes: Free-text (e.g., “Client needs Q2 budget by 5 PM”).
Buttons: “Start Timer,” “Add Subtask,” “Complete.”
**Purpose**: Organizes tasks by priority (agency) tied to intentions (intentionality), solving decision fatigue and goal alignment.
**UX**: Black background, orange (North Star), grey (others), clean sans-serif font (e.g., Inter).

#### **2.3 Focus Timer**

**Description**: A task-linked timer with Focus and Rest modes, enforcing agency via app-blocking and stunning visuals.
**Details**:
**Focus Mode**:
Red fire background, subtle flame animation.
Task: e.g., “Call Client A” (center).
Options: Presets (25/5, 90/30, 50/10), Custom (e.g., 120/20), Stopwatch (minutes only, e.g., “12 min”).
“Start/Pause,” “Switch to Rest” (blue icon).
Haptic buzz + low chime at start/end.
Blocks: User-defined apps (default: X, Instagram, YouTube).
**Rest Mode**:
Blue water background, gentle wave animation.
“Rest” (center, no task).
Same options as Focus.
“Start/Pause,” “Switch to Focus.”
Blocks: Separate list (default: none, e.g., add games).
**Blocking Options**:
Full: App won’t open.
Reminder: Pop-up (“You’re in Focus—resume work?” Yes/No).
Timer: 30s countdown (custom 10-60s) before unlock.
**Sync**: Time logs to task and parent intentions (e.g., “Call Client A” → “Launch landing page”).
**Purpose**: Drives flow (agency) with fire/water appeal, blocks distractions, and balances energy with rest.
**UX**: Swipe from task → Timer → Select mode → Start. Immersive, minimal text.

#### **2.4 Profile/Settings**

**Description**: Displays stats and settings, with minimal gamification for personality.
**Details**:
**Stats**:
“This Week: 5h Focus, 1h Rest, 3 Distracted breaches” (breaches = app open attempts).
“Tasks Completed: 8 (4 North Star).”
**Exp Bar**: “Monk Level 1 - 320/500” (thin orange line, +10/focus hour, +20/task, 2x for North Star, resets weekly).
**Settings**:
“Weekly Reset: Sunday” (dropdown).
“Timer Presets: 25/5, 90/30, 50/10, Custom” (sliders).
“Focus Blocks: X, Instagram” (edit list, Full/Reminder/Timer toggle).
“Rest Blocks: None” (edit list).
“Sound: On/Off,” “Haptics: On/Off.”
**Purpose**: Provides brutal feedback (time, breaches) and control (settings) without fluff.
**UX**: Black base, orange accents, white stats, tap icon to access.

---

### **3. User Experience (UX) Flow**

#### **3.1 Onboarding (First Login)**

**Screen**:
“Welcome to Monk Mode: Forge” (fire-orange logo on black).
“Set your North Star—your one win today.”
Text box: Cycles “Close 1 sales call,” “Record 1 YouTube script,” “Outline $10K offer.”
“Done.”
“Set 3 weekly intentions—1 North Star.”
3 text boxes: Cycles “Launch landing page,” “Batch 5 posts,” “Pitch 10 clients.”
Tap 1 as North Star (orange glow).
“Done.”
“Pick a weekly reset day” (Sunday default).
“Block apps in Focus?” (X, Instagram, YouTube default; add/remove; Full/Reminder/Timer).
“Block apps in Rest?” (None default; add if desired).
**Flow**: 2-3 min → Dashboard.
**Tone**: “This is your vow. Forge it.”

#### **3.2 Daily Flow**

Login → “What’s your sferNorth Star today?” → Dashboard → Swipe task to Timer → Focus/Rest → Check Profile.

#### **3.3 Weekly Flow**

Reset day (e.g., Sunday) → “Set 3 intentions, 1 North Star” → Resume daily flow.

#### **3.4 Visuals**

## Black base, orange (North Star), grey (others), fire (Focus), water (Rest)—stunning, brutal, Monk Mode-worthy.

### **4. Technical Requirements**

#### **4.1 Development Approach**

**Platform**: No-code via CursorAI, supervised by an experienced developer for minimal custom code (e.g., OS API integrations).
**Cost**: $15K-$20K, 2-3 months, 1-2 devs (no-code + supervisor).
**Scope**: Local-only, no cloud sync, no authentication for initial release.

#### **4.2 Tech Stack**

**Frontend**: CursorAI-generated mobile app (iOS/Android), leveraging no-code UI tools and native OS hooks.
**Storage**: SQLite (local, on-device) for intentions, tasks, time logs, settings.
**Integrations**:
**Calendar**: Google Calendar API (read-only, optional context).
**App Blocking**: iOS Screen Time API, Android UsageStatsManager (block apps, track breaches).
**Haptics/Sound**: Native OS APIs (vibration, chime).
**Architecture**:
Local app: SQLite stores all data (intentions, tasks, logs).
Timer: Foreground service, logs Focus/Rest to tasks.
Blocking: OS APIs enforce blocks, log breaches to SQLite.
**Simplicity**:
No Expo—CursorAI handles cross-platform natively.
No cloud—local-first cuts cost/complexity.
No auth—single-user, device-bound.

#### **4.3 Data Categories**

**Focus**: Time in Focus mode.
**Rest**: Time in Rest mode.
**Distracted**: Breach attempts (app opens despite blocks).

---

### **5. Business Requirements**

#### **5.1 Monetization**

**Initial Release**: Free only—no premium separation, no cloud sync. Focus on validating value and building user base.
**Future Consideration**: Post-MVP, introduce:
**Free Tier**: Core features (intentions, timer, blocks, stats).
**Premium ($5/month or $50 one-time)**: Cloud sync, advanced blocking analytics, priority support.
**Goal**: 10K users in 6 months, $5K marketing (X ads, YouTube demo).

#### **5.2 Launch Plan**

**Beta**: 100 users (X, Reddit r/productivity), 1 month, free tier.
**Release**: App Store/Play Store, free, organic growth via X/Reddit buzz.

#### **5.3 Success Metrics**

**Adoption**: 10K downloads.
**Engagement**: 80% daily North Star set, 5+ hours weekly Focus time.
**Feedback**: User retention (70% after 30 days), qualitative reviews (X, beta testers).

---

### **6. Competitive Analysis**

**Notion**: Flexible but bloated—Forge’s brutal focus wins.
**Todoist**: Broad to-do—Forge’s North Star and timer are niche.
**Opal**: Blocking-only—Forge’s intentions and tasks outshine.
**Forest**: Playful timer—Forge’s fire/water and agency are harder.
**Unique Edge**: Intention-timer fusion + brutal Monk Mode ethos.

---

### **7. Risks and Mitigations**

**Clarity Dependence**: Vague North Stars weaken impact.
**Mitigation**: Onboarding explains “epic wins” with examples.
**Data Accuracy**: Blocking breaches need precision.
**Mitigation**: User-defined block lists, simple categories (Focus/Rest/Distracted).
**Niche Appeal**: Limited mass appeal.
**Mitigation**: Lean into Monk Mode—target committed users only.
**Dev Speed**: No-code might hit limits (e.g., API hooks).
**Mitigation**: Dev supervisor ensures feasibility.

---

### **8. Appendix**

#### **8.1 Productivity Problems Addressed**

Goal Alignment: North Star ties tasks to purpose.
Prioritization: GTD list ranks by North Star.
Focus Maintenance: Timer + blocks enforce discipline.
Time Waste Reduction: Blocks cut distractions.
Motivation Maintenance: Fire/water + exp boost drive.
Progress Tracking: Stats show wins.
Energy Management: Rest mode sustains focus.

#### **8.2 Inspirations**

**Hormozi**: Outcome clarity, relentless agency.
**Abdaal**: Purposeful systems, human touch.
**Musk/Bezos**: High agency—logistics over noise.

#### **8.3 Name Rationale**

**Monk Mode: Forge**: Fire (agency) forges intentions (water) into a purposeful life—brutal, intense, aspirational.
