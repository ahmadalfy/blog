---
layout: post
title:  "Testing Google's \"modern-web-guidance\" skill against a real React app"
codepen: false
codehighlighter: true
mermaid: false
date: 2026-07-25 00:00:00
description: "A test of the `modern-web-guidance` skill against a real React app, to see whether it actually catches stale frontend patterns and surfaces current best practices."
---

LLM-assisted frontend work has a particular failure mode. The model confidently writes code that was best-practice in 2021. It reaches for `100vh`, hand-rolls a dark-mode toggle with a class on `<body>`, or disables the submit button to "prevent" invalid input. None of it is *wrong* exactly. It's just a few years stale, because the training data is a few years stale and the web platform moves faster than that.

Google Chrome's [`modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) skill is a direct attempt to fix that. It's not a linter and it's not a codegen tool. It's a **search index over a curated set of best-practice guides**, meant to be consulted *before* you write HTML/CSS/client-side JS, so the pattern you reach for is the current one.

I wanted to know whether it actually earns its place in the loop. So I pointed it at a real codebase, the React frontend of a project-assessment internal tool I've been building, and treated it as an auditor. This is what came back.

## How the skill actually works

There's no magic. It's two commands over `npx`:

```sh
# 1. Search with an action-oriented phrase
npx -y modern-web-guidance@latest search "support dark mode and system color scheme preference"

# 2. Retrieve the full guide(s) by id
npx -y modern-web-guidance@latest retrieve "dark-mode"
```

`search` returns a ranked JSON list. Each hit has an `id`, a `description`, the web `featuresUsed`, a `tokenCount`, and a semantic `similarity` score. `retrieve` returns the guide as markdown.

That's the whole interface. The intelligence is in (a) the quality of the guides themselves and (b) whether the semantic search puts the right guide in front of you. Everything below is a test of both.

## The subject

The app is a Vite + React 18 questionnaire. You answer about 10 questions, it computes a recommended tech stack client-side, and you can save, label, and annotate assessments. It runs to 42 source files. What matters for this exercise is that it's **form-and-input heavy** but has no images and no marketing-page concerns. So the relevant guidance is going to be about forms, inputs, theming, and layout, not LCP hero images.

I did a quick inventory first. The tells were immediate:

- **Zero `<form>` elements.** Every data-entry surface is a bare `<input>` plus a `<button type="button" onClick={...}>`.
- **No `autocomplete`, `inputmode`, or `enterkeyhint`** on any input.
- **A hardcoded light theme.** `theme.css` defines `:root` tokens as literal hex values, with no `color-scheme`, no `prefers-color-scheme`, no dark variant.
- **`min-height: 100vh`** in two places.
- Some genuinely good instincts too, like `<fieldset>`/`<legend>` grouping, `role="alert"` on errors, and `:focus-visible`.

Then I let the skill tell me what to do about each.

## Finding 1 - Dark mode (the flagship miss)

I searched for `"support dark mode and system color scheme preference"`. The top hit came back at **0.75 similarity**, the highest of the whole session:

```json
{
  "id": "dark-mode",
  "featuresUsed": [
    "color-scheme",
    "prefers-color-scheme media query",
    "light-dark()",
    "accent-color"
  ],
  "similarity": 0.7487
}
```

The app's current theming is a wall of light-mode hex:

```css
/* theme.css */
:root {
  --surface-primary: #ffffff;
  --foreground-primary: #1a1a1a;
  --accent-primary: #4a9fd8;
  /* ...no color-scheme, no dark variant anywhere... */
}
```

The retrieved guide is refreshingly opinionated about what's *mandatory* versus optional. The two non-negotiables:

```html
<!-- MANDATORY in <head> to prevent a flash of un-themed content -->
<meta name="color-scheme" content="light dark">
```
```css
/* MANDATORY on :root/html so the browser themes scrollbars,
   form controls, and the canvas background itself */
:root { color-scheme: light dark; }
```

That single `color-scheme` declaration is the highest-leverage line the audit surfaced. Without it, even a perfectly hand-themed dark palette leaves the native scrollbars, `<input>` widgets, and the initial paint canvas stuck in light mode. That's the exact "white flash on load" that makes a dark site feel broken.

Beyond the mandatory two lines, the guide shows how to define color tokens with `light-dark()`, so each token carries its light and dark value in one place. Applied to this app's theme file, the change is small. Every hardcoded hex becomes a pair, plus the two mandatory declarations:

```css
/* theme.css (before) */
:root {
  --surface-primary:    #ffffff;
  --foreground-primary: #1a1a1a;
  --accent-primary:     #4a9fd8;
}

/* theme.css (with the guide applied) */
:root {
  color-scheme: light dark;                        /* themes native UI, kills the flash */
  --surface-primary:    light-dark(#ffffff, #1a1a1a);
  --foreground-primary: light-dark(#1a1a1a, #f0f0f0);
  --accent-primary:     light-dark(#4a9fd8, #6bb6e8);
  accent-color: var(--accent-primary);             /* brand the native radios/checkboxes */
}
```

And updating the `<head>` is just one line:

```html
<!-- index.html -->
<meta name="color-scheme" content="light dark">
```

(The dark values are illustrative inversions. The point is the *shape* of the change, not the exact palette.)

What surprised me is that the guide doesn't stop at CSS. It carries a section on the *design* of a theme toggle. This is part of the guide's own text. You can read it with `retrieve "dark-mode"`, or straight on GitHub in the [dark-mode guide](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/user-experience/dark-mode.md). Its [UX considerations](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/user-experience/dark-mode.md#ux-considerations) subsection makes the sharpest call, arguing that you should *not* build the toggle most of us reflexively build:

> **DON'T** expose all three states (system, light, dark). … Two of the three options always produce the same visual result, violating the principle of feedback.

Instead it argues for a two-state control, "follow the system" and "the opposite of the system." It also spells out the edge case that trips people up. If a user pins dark and then switches their OS to dark too, the site must *stay* dark rather than flip. That's product judgment sitting inside a CSS guide, and it's exactly the kind of thing a model won't reliably volunteer on its own.

Finally, because `light-dark()` is newer than `color-scheme`, the guide hands over the fallback so you don't have to reason it out. You degrade through `prefers-color-scheme`, then upgrade with `@supports` where `light-dark()` exists.

```css
:root {
  --accent-primary: #4a9fd8;                          /* light default, works everywhere */

  @media (prefers-color-scheme: dark) {
    --accent-primary: #6bb6e8;                        /* dark, for browsers without light-dark() */
  }
  @supports (color: light-dark(white, black)) {
    --accent-primary: light-dark(#4a9fd8, #6bb6e8);   /* modern browsers, single source of truth */
  }

  color-scheme: light dark;
}
```

It also ships a copy-paste script to prevent the theme flash for users who have pinned a non-default choice. That script is a plain inline one, deliberately not `defer` and not a module, so it reads the saved preference before first paint. And that brings up the skill's best structural feature.

## The Baseline discipline

When a guide leans on anything newer than the long-settled web, it keys its browser-support advice to **[Baseline](https://web.dev/baseline)**. For `color-scheme`, the dark-mode guide returned that it's widely available and has been Baseline since 2022-02-03. For `light-dark()`, it returned that it's newly available and Baseline since 2024-05-13.

<script src="https://cdn.jsdelivr.net/npm/baseline-status@1/baseline-status.min.js" type="module"></script>
<baseline-status featureId="color-scheme"></baseline-status>
<baseline-status featureId="light-dark"></baseline-status>

This matters because it turns "should I use this?" from a vibe into a decision rule. The skill's own instructions say Baseline-Widely-available features are safe to use unfenced, while newer features *must* carry the fallback the guide provides, unless you've declared a custom browser-support policy. In other words it defaults to safe, and it tells you exactly where the risk line is instead of leaving you to guess. `color-scheme` is safe to just ship, while `light-dark()` gets a `@supports`-guarded fallback. That's the correct call, and it made it without me having to ask.

## Finding 2 - The forms that aren't forms

I searched for `"build an accessible form with submit handling"`. That surfaced the `forms` guide at 0.50 similarity, with `accessibility` and an `autofill-sign-in-form` guide right behind it.

Here's the app's save surface, lightly trimmed:

```tsx
// the "Save Assessment" panel
<div className="save-area">
  <label className="label-field">
    <span>Label (optional)</span>
    <input value={label} onChange={(e) => setLabel(e.target.value)} />
  </label>
  <button type="button" className="save-button" onClick={handleSave}>
    Save Assessment
  </button>
</div>
```

The guide's very first rule is blunt about it. *"DO use the `<form>` element to wrap interactive controls… DON'T use `type="button"` for primary submission buttons."* The rename field and the notes editor elsewhere in the app repeat the same `div`-plus-`onClick` shape.

The practical cost of the current approach isn't abstract. Because there's no `<form>`, **pressing Enter in the label field does nothing**, and that's a reflex every keyboard user has. The fix is small, and the guide hands it over directly, including the AJAX-friendly submit handler:

```js
form.addEventListener('submit', (e) => {
  e.preventDefault();     // stay client-side
  const data = new FormData(form);
  // ...call the API...
});
```

Wrap the input and button in a `<form onSubmit={...}>`, make the button `type="submit"`, and Enter-to-submit comes back for free, along with native form semantics for assistive tech.

I'll give the skill credit for a fair grade, too. One thing the app *already* does right showed up in the same guide. The save button disables itself while a save is in flight, and the guide explicitly blesses that. *"DO disable the button after a valid submission is clicked to prevent double-posts."* This is the opposite of the anti-pattern from the intro. Disabling *after* a valid click to stop double-submits is good, while disabling *up front* to block an incomplete form is the dead end. A good auditor tells you what to keep, not only what to change.

## Finding 3 - Validation timing

I searched for `"client side form validation feedback"`. It surfaced a cluster of tightly-scoped guides, `required-field-feedback`, `validate-input-after-interaction`, and `accessible-error-announcement`, all built around `:user-valid` and `:user-invalid`.

This is where the guides go deeper than a model's default answer. Ask a chatbot "how do I validate a form field" and you'll usually get an `onChange` handler that yells the moment you type one character. The guide instead ships a **timing matrix**:

| Trigger | Action | Logic |
| --- | --- | --- |
| `input` (typing) | *Clear* existing errors only | Don't yell before they finish |
| `blur` | *Run* the check, show the error | Validate when they're "done" with the field |
| `submit` | *Block* and route focus | Final gatekeeper |

The guide even boils it down to a single rule. *"Validate on `blur` to avoid premature warnings while typing, and reset error states on `input` as soon as the user attempts a correction."* The modern platform gives you this essentially for free via the `:user-invalid` pseudo-class, which only matches *after* the user has interacted. The app's ad-hoc `role="alert"` error paragraphs are accessible, which is another thing it got right, but they're wired by hand where the platform now has a purpose-built primitive.

## Finding 4 - A rule that (mostly) doesn't apply here

The `forms` guide's section 3 covers `autocomplete`, `inputmode`, and `enterkeyhint`, the attributes that tune autofill and the on-screen keyboard. None of the app's inputs use them, and this is the one finding where the honest answer is a polite no.

The questionnaire is almost entirely `<input type="radio">`, where you pick one of a handful of options. Radios don't take an `inputmode` or an `autocomplete` token, because there's no keyboard to optimise and nothing to autofill. The only free-text fields in the whole app are a "label" and a "notes" box, and neither maps to a standard autofill value.

So the guidance is correct in general and largely irrelevant here, and *noticing that* is the actual work. The tool returns a rule. Deciding it doesn't apply to a radio-driven form is a judgment call it can't make for you. This is the clearest example in the whole audit of why the skill is only half the loop. One line from the section does still land universally, though. Text inputs should be `font-size: 1rem` or larger, because anything smaller triggers an auto-zoom on iOS Safari the moment the field is focused.

## Finding 5 - `100vh` on mobile

The app has `min-height: 100vh` in two files. The well-known modern fix is `100dvh` (dynamic viewport height), which accounts for mobile browser chrome that `100vh` ignores. On iOS Safari, `100vh` is measured against the *expanded* viewport, so the bottom of a `100vh` layout sits behind the address bar.

My query `"full height layout mobile viewport units"` returned the broad `css-layout` and `css` guides rather than a laser-focused "use dvh" atom. The right answer is almost certainly *inside* those guides, but the search didn't hand me a `dvh`-titled hit the way it did for `dark-mode`. Which is a fair segue into the honest assessment.

## Where the skill is genuinely strong

- **The guides are high quality.** They read less like scraped blog posts and more like a curated reference assembled by people who live in the web platform, close to the specs and the browser internals, but writing for the developer who actually has to ship. The mandatory/optional split, the timing matrices, and the "don't build a three-way toggle" UX arguments all read as earned judgment, not a spec dump.
- **Baseline-keyed fallbacks where a feature needs one.** This is the single best thing about it. It converts "is this safe?" into a date comparison and provides the exact fallback when the answer is "not yet." You don't have to look for the fallback, it comes with the guidance.
- **It grades fairly.** In two places it validated code the app already had right. An auditor you can trust to say "keep this" is one you'll actually keep running.
- **Framework-agnostic by design.** Every guide is HTML/CSS/DOM, and adapting the `<form onSubmit>` pattern to React was trivial. Nothing assumed a framework, so nothing fought mine.
- **It's local, self-contained, and keyless.** The semantic search runs on your own machine through a small on-device model, so the matching itself makes no network calls and there are no API keys to manage. The npm package ships with no extra dependencies, which keeps latency low and the supply-chain surface small, and the CLI can run fully offline. By default the tool reports anonymous usage statistics to Google, including your search queries and guide retrievals, which you can turn off by setting `DISABLE_TELEMETRY=1`.

## Where it has limits

- **It doesn't read your code. You (or your agent) do.** This is the big one, and it's worth being exact about, because it changes how you run the skill. Nothing in this audit was automatic. The app had to be read, the suspect patterns spotted, each one turned into a search phrase, and the returned guidance compared back against the actual lines. There are two ways to do that. You can drive it by hand, deciding what to search, reading the guides, and applying them yourself. Or you can hand the whole loop to a coding agent, which is what I did here. The agent inventoried the frontend, chose the queries, retrieved the guides, and did the comparison, while the skill only ever answered "here is the current best practice for *X*." Either way, the skill supplies the standard and something else supplies the code-reading. Point it at a codebase with no idea what you're looking for and it hands you nothing back.
- **Semantic search has a recall ceiling.** `dark-mode` hit at 0.75, but the `dvh` answer never surfaced as its own result. When a query returns only broad category guides, you have to retrieve a large omnibus guide and read it yourself, which brings up cost.
- **The guides aren't small, but the skill is upfront about it.** Every search result carries a `tokenCount` in its JSON. The `forms` guide reports about 4,500, and `accessibility` about 7,100. I didn't measure those myself, because the tool hands them to you before you fetch, so you can weigh the cost. Retrieving a few of them still meaningfully fills a context window. That's fine for a deliberate audit, but something to watch if you wire it into every edit.

## The verdict

`modern-web-guidance` is not going to catch your bugs and it won't rewrite your components. What it *does* is remove the single most common source of stale frontend code, the confident-but-outdated pattern. In one afternoon pointed at a real app, it correctly flagged a missing `color-scheme` declaration, a set of forms that skip native submission, a validation approach that predates `:user-invalid`, and a pile of missing input attributes. For each one it handed over current, Baseline-checked, copy-pasteable guidance, while also telling me which of my existing choices to leave alone.

One reframe stuck with me. It's less a tool you *run* and more a **standard you consult**. The best time to reach for it isn't during a cleanup audit like this one. It's the moment before you write a component, when the model in the loop (human or AI) is about to reach for the pattern it already knows. Half the time, the pattern it knows is three years old. This is the cheap check that catches it.
