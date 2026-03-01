# AGENTS.md — RBS ESL Learning Studios (Codex CLI Guidance)

This file tells Codex CLI how to work inside this repo.

## Mission (what we build)

Build **interactive ESL web activities** for Brazilian learners (kids → adults; A1–B1+) by turning “paper exercises” into **dynamic, engaging, choice-rich** web modules.

Pedagogy rules:
- **CLT first** (communication and meaning before “perfect grammar”).
- **ESA flow** (Engage → Study → Activate): hook learners, teach clearly, then get them producing language.
- Always include **scaffolding**, **guided production**, and **confidence-building**.

## Stack (keep it simple)

Default stack:
- **Vanilla HTML + CSS + JS**
- Browser-native voice:
  - `window.speechSynthesis` for TTS
  - `window.SpeechRecognition` (or webkit prefix where needed) for STT
- Optional: a lightweight, custom JS audio recording helper (no heavy frameworks unless asked).

Avoid:
- Big frameworks (React/Vue/etc.) unless explicitly requested.
- Branding/logos from real companies in UI/demo assets.

## Repo layout (expected)

Use this structure (adapt if repo already differs):

```
/activities/              # standalone HTML activities (one per activity)
/js/
  /activities/            # activity-specific JS modules
/css/                     # shared + per-activity CSS
/assets/
  /images/
  /audio/
```

Conventions:
- Each activity should be **self-contained**: one HTML entry + a JS module + optional CSS file.
- Use predictable names:
  - `activities/<topic>_<level>.html`
  - `js/activities/<topic>_<level>.js`
  - `css/<topic>_<level>.css`

## UX principles (non-negotiable)

- Fast, clean UI (students should “get it” in 5 seconds).
- Big tap targets, readable typography, minimal clutter.
- Provide clear **success feedback** (sound + visual) and gentle error guidance.
- Add “teacher controls” when useful:
  - reveal answers
  - reset activity
  - difficulty/scaffold toggles (e.g., hints on/off)

## Voice-first features (when applicable)

When an activity benefits from speaking/listening:
- TTS:
  - short, natural sentences
  - avoid long monologues
  - add replay button
- STT:
  - tolerate minor recognition errors
  - grade by intent/keywords when possible
  - always provide a fallback (“Type your answer”)

If SpeechRecognition isn’t supported, degrade gracefully.

## Activity design patterns (prefer these)

Pick patterns that work well live on Zoom/Meet:

- **Builder / Player**
  - Builder: teacher creates items (prompts, answers, hints, audio)
  - Player: student plays the drill
- **Choice-based production**
  - learner picks chunks to build a sentence
  - show live preview + meaning notes
- **Drills with levels**
  - Level 1: heavy scaffolding (prompts + choices)
  - Level 2: fewer hints
  - Level 3: free production

Always include:
- Instructions in simple English (and optional PT-BR helper text if requested)
- CCQs (Concept Checking Questions) for meaning, when the target language is new

## Coding standards

- Write modern, readable JS (ES2020+), no magic globals.
- Prefer modules and small functions.
- Keep state in one place (simple store object).
- Comment tricky parts only; don’t narrate obvious code.
- Validate user input; never crash on empty/invalid states.
- Accessibility basics:
  - semantic HTML
  - keyboard support for core actions
  - ARIA only when needed

## Content generation guidance (how Codex should think)

When asked to generate an activity:
1. Identify the **learning objective** (meaning + form + use).
2. Decide the pattern (quiz, matching, builder, roleplay, drill).
3. Design the ESA sequence:
   - Engage: quick hook (image/prompt)
   - Study: controlled practice + micro-feedback
   - Activate: freer task, ideally communicative
4. Add scaffolding toggles for teacher.

When asked to convert worksheets:
- Keep original question order where possible.
- Add interactivity without “changing the test”.
- Keep scoring clear and exportable (copy results, simple JSON).

## What to output in Codex CLI runs

- If the user asks for a file: **create/modify files directly**.
- If implementing a feature: include:
  - what changed
  - where to run it (open HTML file, or simple local server)
  - any browser compatibility notes (especially for speech APIs)

## Safety / privacy

- No collection of personal data.
- Don’t embed tracking.
- No external calls unless explicitly required.
