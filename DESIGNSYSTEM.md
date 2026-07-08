# Exam Studio Design System

Version 1.0

---

# Design Philosophy

Exam Studio is not a dashboard.

It is not an admin panel.

It is not a landing page.

It should feel like a native desktop application running inside a browser.

The design language is inspired by:

- macOS Finder
- Apple Files
- Arc Browser
- Notion
- Linear
- Kintsugi

The interface should prioritize clarity over decoration.

Everything should look quiet.

Calm.

Professional.

Focused.

The application should disappear.

Only the user's content should stand out.

---

# Design Keywords

Minimal

Clean

Calm

Lightweight

Content First

Desktop Feel

Structured

Quiet

Neutral

Professional

Predictable

---

# UI Principles

Everything should have purpose.

Every element must justify its existence.

Avoid decorative elements.

Avoid visual noise.

Whitespace is more valuable than colors.

Typography is more important than icons.

Hierarchy is more important than borders.

---

# Layout

The application always consists of:

Left Sidebar

↓

Top Toolbar

↓

Workspace

↓

Optional Right Inspector

Never change this layout.

---

# Sidebar

Width

260px

Resizable in future.

Sidebar contains:

Subjects

Folders

Navigation

Settings

User

Sidebar background should be slightly darker than Workspace.

No shadows.

No gradients.

---

# Workspace

Workspace uses a neutral background.

Almost white.

Content should breathe.

Large spacing.

Everything aligned to an 8px grid.

---

# Inspector Panel

Right panel is optional.

Appears only when needed.

Contains:

Properties

Metadata

Statistics

Information

Never use popup for information that belongs here.

---

# Typography

Use Inter.

Weights

400

500

600

700

No other font.

Never use uppercase titles.

Use sentence case.

---

# Heading Scale

Page Title

36

Section

24

Card Title

18

Body

14

Caption

12

---

# Colors

Use neutral colors.

Primary

Black

White

Gray

Accent

Blue

Only one accent color.

Never use more than one primary accent.

---

# Forbidden Colors

Gradient

Rainbow

Purple

Orange

Pink

Green as decoration

Use colors only for meaning.

---

# Border Radius

Cards

20px

Buttons

12px

Inputs

12px

Folders

24px

Dialog

20px

---

# Shadows

Very soft.

Almost invisible.

Avoid elevation.

Use contrast instead.

---

# Icons

Icons are optional.

Never decorate UI with icons.

Only use icons when they improve recognition.

Examples:

Folder

Search

Settings

Back

More

Never use icons beside every menu.

No emoji.

No colorful icons.

No illustrations.

---

# Buttons

Three variants only.

Primary

Secondary

Ghost

No floating buttons.

No circular buttons.

No FAB.

---

# Inputs

Large.

Rounded.

Simple.

No colored borders.

Focus only changes border color.

---

# Folder Card

The Folder Card is the primary visual component of the application.

Inspired by macOS Finder.

Each folder contains:

Folder Illustration

↓

Title

↓

Metadata

↓

Optional Tag

No action buttons visible by default.

Actions appear on hover.

---

# Hover

Hover should be subtle.

Small shadow.

Slight border.

No scaling animation.

No bouncing.

---

# Motion

Motion should feel invisible.

Duration

150~200ms

Ease-out

Never animate large distances.

Never animate layout unnecessarily.

---

# Grid

Folders are displayed using CSS Grid.

Gap

24px

Responsive

Auto-fit

Large cards.

Never use tables for libraries.

---

# Cards

Cards are containers.

Not decorations.

Avoid nested cards.

One level only.

---

# Search

Search should always stay near the top.

Large input.

Rounded.

Quiet.

No search button.

---

# Toolbar

Toolbar contains:

Breadcrumb

Search

Actions

Filter

Sort

Nothing else.

---

# Context Menu

Prefer Context Menu over Action Buttons.

Keep UI clean.

---

# Dialog

Dialogs should be centered.

Maximum width

640px

Large padding.

Simple layout.

No unnecessary icons.

---

# Empty State

Simple illustration.

One sentence.

One action.

No large graphics.

---

# Loading

Skeleton.

Never spinner unless waiting less than one second.

---

# Selection

Selected Folder

↓

Blue border

↓

Light blue background

Not dark.

---

# Navigation

Everything should feel like browsing folders.

Not switching pages.

Transitions should preserve context.

---

# Spacing

Use an 8px spacing system.

4

8

16

24

32

40

48

64

Never random spacing.

---

# Density

Medium density.

Never cramped.

Never oversized.

---

# Responsive

Desktop First.

Tablet Second.

Mobile Last.

This is primarily a desktop workspace.

---

# Overall Feeling

The application should feel like:

"I am organizing knowledge."

Not

"I am filling forms."

Users should experience the interface as if they are browsing a beautifully organized file system.

The UI should disappear behind the content.