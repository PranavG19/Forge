Current State
Forge's todo list (Dashboard), as outlined in the PRD (Section 2.2) and visible in the screenshot (old_home.png), is a basic, priority-based list with categories "Today," "Next," and "Later." It supports collapsible sections, subtasks, and swipe actions to start the Focus Timer, with a Daily North Star intention displayed prominently. However, the feature set and user experience fall short of modern standards:

Limited Features: Lacks projects, tags, reminders, and natural language input, which are standard in leading todo list apps. Subtasks exist but are rudimentary, missing checklist functionality and progress tracking within projects.
Poor UI/UX: The current dark theme (black background, orange North Star, grey accents) feels unappealing and cluttered, lacking the calming, minimalistic design users expect. The orange color, in particular, has been flagged as unappealing by stakeholders.
Weak Task Organization: The "Today," "Next," "Later" categories don’t align with modern workflows (e.g., Things3’s "Today," "Upcoming," "Someday"). There’s no separate area for projects, and tasks aren’t structured for calendar integration.
Missing Modern Functionality: Features like natural language date parsing ("Jump Start"), time-based reminders, and quick search via tags are absent, limiting usability for tech-savvy users in "Monk Mode."
Competitive Landscape
Modern todo list apps like Things3 and Todoist set a high bar for functionality and design, which Forge currently fails to meet:

Things3: Known for its Apple Design Award-winning design, Things3 offers a clean, light-mode UI with a focus on simplicity and productivity. It includes projects (with headings and progress pies), subtasks (checklists), views like "Today," "Upcoming," "Anytime," and "Someday," natural language input for scheduling ("tomorrow at 5pm"), time-based reminders, tags for quick find, and calendar integration. Its calming aesthetic and intuitive navigation make it a favorite for GTD (Getting Things Done) users.
Todoist: A cross-platform leader, Todoist provides robust task management with projects, labels (tags), natural language input, reminders, and filters. It excels in collaboration and flexibility, though its UI is less visually refined than Things3’s.
Forge’s current implementation lacks the depth and polish of these apps, risking irrelevance among our target audience (entrepreneurs, students, creators aged 20-40) who demand seamless, feature-rich tools to support their intense focus and discipline.

2. Goals of the Pivot
To remain competitive and fulfill Forge’s mission of bridging agency and intentionality for "Monk Mode" users, we need to pivot the todo list to match the feature set and user experience of modern apps like Things3, while preserving our unique elements (Focus Timer, XP system, app-blocking). Key goals include:

Rich Feature Set: Introduce projects, enhanced subtasks with checklists, tags for quick find, time-based reminders, and natural language input for scheduling.
Modern Task Views: Restructure categories into "Today," "Upcoming," and "Someday," with a separate "Projects" area, preparing for future calendar integration.
Calming UI: Transition to a light-mode design inspired by Things3, using a white/light gray background, dark text, and a colorful palette (e.g., blue, green, red), dropping the unappealing orange accents.
Preserve Unique Identity: Retain the Daily North Star (recolored to fit the new scheme), Focus Timer integration, XP system, and app-blocking, ensuring they align with the new design.
Future-Proofing: Structure data for Google Calendar integration and ensure the UI can support a dark mode toggle later.
3. Key Changes in the Pivot
Feature Enhancements
Projects: Introduce projects as containers for tasks, replacing weekly intentions (which are now dropped). One project can be marked as the North Star, with progress indicators (e.g., pies or bars) for completion tracking.
Subtasks: Enhance subtasks with checklists, allowing users to check off steps, with visual progress tracking within tasks and projects.
Tags and Quick Find: Add tags to tasks for categorization and quick search, enabling users to filter tasks efficiently.
Reminders and Jump Start: Implement time-based reminders using native notifications and natural language input for scheduling (e.g., "tomorrow at 5pm"), aligning with Things3’s "Jump Start" feature.
Task Views: Redefine categories as "Today" (tasks due today, North Star, calendar events), "Upcoming" (future tasks), and "Someday" (unscheduled tasks), with "Projects" as a separate navigable area via bottom tabs.
UI Redesign
Light Mode: Pivot to a Things3-inspired light mode with a white (#FFFFFF) or light gray (#F5F5F5) background, dark text (#333333), and colorful accents (e.g., blue #4A90E2 for headers, green #50C878 for North Star, red #FF4444 for overdue tasks). Use ample white space and sans-serif fonts (e.g., Inter) for a calming, minimalistic look.
Daily North Star: Display the Daily North Star at the top of the todo list in green, with a clean, bold design, ensuring it stands out without overwhelming the UI.
Dark Mode Readiness: Structure the theme to support a future dark mode toggle by defining color variants (e.g., darkMode: { background: '#1C2526', ... }).
Data Preparation
Calendar Integration: Add dueDate and dueTime fields to tasks, preparing for future Google Calendar integration without implementing the full sync yet.
Task Structure: Extend the task model to include projectId, tags, reminder, and dueDate, ensuring flexibility for modern workflows.
Unique Features
Maintain the Focus Timer (accessible via swipe on tasks), XP system (+20 per task, +40 for North Star), and app-blocking, adapting their visuals (e.g., fire/water themes) to fit the light mode aesthetic.
4. Expected Outcomes
This pivot aims to transform Forge’s todo list into a competitive, user-friendly feature that rivals Things3 and Todoist, while catering to our niche "Monk Mode" audience. Expected outcomes include:

Improved Usability: A richer feature set and intuitive navigation will make task management seamless, aligning with users’ needs for clarity and action.
Enhanced Appeal: A calming, modern UI will attract and retain users, addressing feedback about the current "horrible" design.
Future Scalability: Structured data and theme design will simplify future enhancements like calendar integration and dark mode.
User Retention: By matching the functionality of leading apps while preserving Forge’s unique focus-driven features, we expect higher engagement (e.g., 80% daily North Star set, 5+ hours weekly Focus time) and retention (70% after 30 days), as outlined in PRD Section 5.3.
5. Next Steps
The detailed Implementation Guide provides actionable steps for a coding agent to execute this pivot, focusing on UI redesign, view restructuring, and feature enhancements. We will monitor user feedback post-implementation to prioritize additional features (e.g., full calendar integration, dark mode) in future iterations, ensuring Forge remains a focused, purpose-driven tool for "Monk Mode" users.
