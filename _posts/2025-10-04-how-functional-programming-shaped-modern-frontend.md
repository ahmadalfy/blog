---
layout: post
title:  'How Functional Programming Shaped (and Twisted) Frontend Development'
codepen: false
codehighlighter: false
date: 2025-10-04 00:00:00
description: "\"What are these generated classes? Did we cancel the cascade?\" A backend developer's confusion reveals how functional programming reshaped and complicated frontend development."
---

A friend called me last week. Someone who'd built web applications back for a long time before moving exclusively to backend and infra work. He'd just opened a modern React codebase for the first time in over a decade.

"What the hell is this?" he asked. "What are all these generated class names? Did we just... cancel the cascade? Who made the web work this way?"

I laughed, but his confusion cut deeper than he realized. He remembered a web where CSS cascaded naturally, where the DOM was something you worked *with*, where the browser handled routing, forms, and events without twenty abstractions in between. To him, our modern frontend stack looked like we'd declared war on the platform itself.

He asked me to explain how we got here. That conversation became this essay.

**A disclaimer before we begin**: This is one perspective, shaped by having lived through the first browser war. I applied `pngfix.js` to make 24-bit PNGs work in IE6. I debugged hasLayout bugs at 2 AM. I wrote JavaScript when you couldn't trust `addEventListener` to work the same way across browsers. I watched jQuery become necessary, then indispensable, then legacy. I might be wrong about some of this. My perspective is biased for sure, but it also comes with the memory that the web didn't need constant reinvention to be useful.

## Introduction

There's a strange irony at the heart of modern web development. The web was born from documents, hyperlinks, and a cascading stylesheet language. It was always messy, mutable, and gloriously side-effectful. Yet over the past decade, our most influential frontend tools have been shaped by engineers chasing functional programming purity: immutability, determinism, and the elimination of side effects.

This pursuit gave us powerful abstractions. React taught us to think in components. Redux made state changes traceable. TypeScript brought compile-time safety to a dynamic language. But it also led us down a strange path. A one where we fought against the platform instead of embracing it. We rebuilt the browser's native capabilities in JavaScript, added layers of indirection to "protect" ourselves from the DOM, and convinced ourselves that the web's inherent messiness was a problem to solve rather than a feature to understand.

The question isn't whether functional programming principles have value. They do. The question is whether applying them dogmatically to the web (a platform designed around mutability, global scope, and user-driven chaos) made our work better, or just more complex.

## The Nature of the Web

To understand why functional programming ideals clash with web development, we need to acknowledge what the web actually is.

**The web is fundamentally side-effectful.** CSS cascades globally by design. Styles defined in one place affect elements everywhere, creating emergent patterns through specificity and inheritance. The DOM is a giant mutable tree that browsers optimize obsessively; changing it directly is fast and predictable. User interactions arrive asynchronously and unpredictably: clicks, scrolls, form submissions, network requests, resize events. There's no pure function that captures "user intent."

**This messiness is not accidental.** It's how the web scales across billions of devices, remains backwards-compatible across decades, and allows disparate systems to interoperate. The browser is an open platform with escape hatches everywhere. You can style anything, hook into any event, manipulate any node. That flexibility and that refusal to enforce rigid abstractions is the web's superpower.

When we approach the web with functional programming instincts, we see this flexibility as chaos. We see globals as dangerous. We see mutation as unpredictable. We see side effects as bugs waiting to happen. And so we build walls.

## Enter Functional Programming Ideals

Functional programming revolves around a few core principles: functions should be pure (same inputs → same outputs, no side effects), data should be immutable, and state changes should be explicit and traceable. These ideas produce code that's easier to reason about, test, and parallelize, in the right context of course.

These principles had been creeping into JavaScript long before React. Underscore.js (2009) brought map, reduce, and filter to the masses. Lodash and Ramda followed with deeper FP toolkits including currying, composition and immutability helpers. The ideas were in the air: avoid mutation, compose small functions, treat data transformations as pipelines.

React itself started with class components and `setState`, hardly pure FP. But the conceptual foundation was there: treat UI as a function of state, make rendering deterministic, isolate side effects. Then came Elm, a purely functional language created by Evan Czaplicki that codified the "Model-View-Update" architecture. When Dan Abramov created Redux, he explicitly cited Elm as inspiration. Redux's reducers are directly modeled on Elm's update functions: `(state, action) => newState`.

Redux formalized what had been emerging patterns. Combined with React Hooks (which replaced stateful classes with functional composition), the ecosystem shifted decisively toward FP. Immutability became non-negotiable. Pure components became the ideal. Side effects were corralled into `useEffect`. Through this convergence (library patterns, Elm's rigor, and React's evolution) Haskell-derived ideas about purity became mainstream JavaScript practice.

In the early 2010s, as JavaScript applications grew more complex, developers looked to FP for salvation. jQuery spaghetti had become unmaintainable. Backbone's two-way binding caused cascading updates (ironically, Backbone's documentation explicitly advised against two-way binding saying "it doesn't tend to be terribly useful in your real-world app" yet many developers implemented it through plugins). The community wanted discipline, and FP offered it: treat your UI as a pure function of state. Make data flow in one direction. Eliminate shared mutable state.

React's arrival in 2013 crystallized these ideals. It promised a world where `UI = f(state)`: give it data, get back a component tree, re-render when data changes. No manual DOM manipulation. No implicit side effects. Just pure, predictable transformations.

This was seductive. And in many ways, it worked. But it also set us on a path toward rebuilding the web in JavaScript's image, rather than JavaScript in the web's image.

## How FP Purism Shaped Modern Frontend

### CSS-in-JS: The War on Global Scope

CSS was designed to be global. Styles cascade, inherit, and compose across boundaries. This enables tiny stylesheets to control huge documents, and lets teams share design systems across applications. But to functional programmers, global scope is dangerous. It creates implicit dependencies and unpredictable outcomes.

Enter CSS-in-JS: styled-components, Emotion, JSS. The promise was component isolation. Styles scoped to components, no cascading surprises, no naming collisions. Styles become *data*, passed through JavaScript, predictably bound to elements.

But this came at a cost. CSS-in-JS libraries generate styles at runtime, injecting them into `<style>` tags as components mount. This adds JavaScript execution to the critical rendering path. Server-side rendering becomes complicated. You need to extract styles during the render, serialize them, and rehydrate them on the client. Debugging involves runtime-generated class names like `.css-1xbq8d9`. And you lose the cascade; the very feature that made CSS powerful in the first place.

Worse, you've moved a browser-optimized declarative language into JavaScript, a single-threaded runtime. The browser can parse and apply CSS in parallel, off the main thread. Your styled-components bundle? That's main-thread work, blocking interactivity.

The web had a solution. It's called a stylesheet. But it wasn't *pure* enough.

The industry eventually recognized these problems and pivoted to Tailwind CSS. Instead of runtime CSS generation, use utility classes. Instead of styled-components, compose classes in JSX. This was better, at least it's compile-time, not runtime. No more blocking the main thread to inject styles. No more hydration complexity.

But Tailwind still fights the cascade. Instead of writing `.button { padding: 1rem; }` once and letting it cascade to all buttons, you write `class="px-4 py-2 bg-blue-500"` on every single button element. You've traded runtime overhead for a different set of problems: class soup in your markup, massive HTML payloads, and losing the cascade's ability to make sweeping design changes in one place.

And here's where it gets truly revealing: when Tailwind added support for nested selectors using `&` (a feature that would let developers write more cascade-like styles), parts of the community revolted. David Khourshid (creator of XState) [shared examples](https://x.com/DavidKPiano/status/1969054758318051432) of using nested selectors in Tailwind, and the backlash was immediate. Developers argued this defeated the purpose of Tailwind, that it brought back the "problems" of traditional CSS, that it violated the utility-first philosophy.

Think about what this means. The platform has cascade. CSS-in-JS tried to eliminate it and failed. Tailwind tried to work around it with utilities. And when Tailwind cautiously reintroduced a cascade-like feature, developers who were trained by years of anti-cascade ideology rejected it. We've spent so long teaching people that the cascade is dangerous that even when their own tools try to reintroduce platform capabilities, they don't want them.

We're not just ignorant of the platform anymore. We're ideologically opposed to it.

### Synthetic Events: Abstracting Away the Platform

React introduced synthetic events to normalize browser inconsistencies and integrate events into its rendering lifecycle. Instead of attaching listeners directly to DOM nodes, React uses event delegation. It listens at the root, then routes events to handlers through its own system.

This feels elegant from a functional perspective. Events become data flowing through your component tree. You don't touch the DOM directly. Everything stays inside React's controlled universe.

But native browser events already work. They bubble, they capture, they're well-specified. The browser has spent decades optimizing event dispatch. By wrapping them in a synthetic layer, React adds indirection: memory overhead for event objects, translation logic for every interaction, and debugging friction when something behaves differently than the native API.

Worse, it trains developers to avoid the platform. Developers learn React's event system, not the web's. When they need to work with third-party libraries or custom elements, they hit impedance mismatches. `addEventListener` becomes a foreign API in their own codebase.

Again: the web had this. The browser's event system is fast, flexible, and well-understood. But it wasn't *controlled* enough for the FP ideal of a closed system.

### Client-Side Rendering and Hydration: Reinventing the Browser

The logical extreme of "UI as a pure function of state" is client-side rendering: the server sends an empty HTML shell, JavaScript boots up, and the app renders entirely in the browser. From a functional perspective, this is clean. Your app is a deterministic function that takes initial state and produces a DOM tree.

From a web perspective, it's a disaster. The browser sits idle while JavaScript parses, executes, and manually constructs the DOM. Users see blank screens. Screen readers get empty documents. Search engines see nothing. Progressive rendering which is one of the browser's most powerful features, goes unused.

The industry noticed. Server-side rendering came back. But because the mental model was still "JavaScript owns the DOM," we got *hydration*: the server renders HTML, the client renders the same tree in JavaScript, then React walks both and attaches event handlers. During hydration, the page is visible but inert. Clicks do nothing, forms don't submit.

This is architecturally absurd. The browser already rendered the page. It already knows how to handle clicks. But because the framework wants to own all interactions through its synthetic event system, it must re-create the entire component tree in JavaScript before anything works.

The absurdity extends beyond the client. Infrastructure teams watch in confusion as every user makes *double the number of requests*: the server renders the page and fetches data, then the client boots up and fetches the exact same data again to reconstruct the component tree for hydration. Why? Because the framework can't trust the HTML it just generated. It needs to rebuild its internal representation of the UI in JavaScript to attach event handlers and manage state.

This isn't just wasteful, it's expensive. Database queries run twice. API calls run twice. Cache layers get hit twice. CDN costs double. And for what? So the framework can maintain its pure functional model where all state lives in JavaScript. The browser had the data. The HTML had the data. But that data wasn't in the right *shape*. It wasn't a JavaScript object tree, so we throw it away and fetch it again.

Hydration is what happens when you treat the web like a blank canvas instead of a platform with capabilities. The web gave us streaming HTML, progressive enhancement, and instant interactivity. We replaced it with JSON, JavaScript bundles, duplicate network requests, and "please wait while we reconstruct reality."

### The Modal Problem: Teaching Malpractice as Best Practice

Consider the humble modal dialog. The web has `<dialog>`, a native element with built-in functionality: it manages focus trapping, handles Escape key dismissal, provides a backdrop, controls scroll-locking on the body, and integrates with the accessibility tree. It exists in the DOM but remains hidden until opened. No JavaScript mounting required. It's fast, accessible, and battle-tested by browser vendors.

Now observe what gets taught in tutorials, bootcamps, and popular React courses: build a modal with `<div>` elements. Conditionally render it when `isOpen` is true. Manually attach a click-outside handler. Write an effect to listen for the Escape key. Add another effect for focus trapping. Implement your own scroll-lock logic. Remember to add ARIA attributes. Oh, and make sure to clean up those event listeners, or you'll have memory leaks.

You've just written 100+ lines of JavaScript to poorly recreate what the browser gives you for free. Worse, you've trained developers to *not even look* for native solutions. The platform becomes invisible. When someone asks "how do I build a modal?", the answer is "install a library" or "here's my custom hook," never "use `<dialog>`."

The teaching is the problem. When influential tutorial authors and bootcamp curricula skip native APIs in favor of React patterns, they're not just showing an alternative approach. They're actively teaching malpractice. A generation of developers learns to build inaccessible `<div>` soup because that's what fits the framework's reactivity model, never knowing the platform already solved these problems.

And it's not just bootcamps. Even the most popular component libraries make the same choice: shadcn/ui builds its Dialog component on Radix UI primitives, which use `<div role="dialog">` instead of the native `<dialog>` element. There are open GitHub issues requesting native `<dialog>` support, but the implicit message is clear: it's easier to reimplement the browser than to work with it.

### When Frameworks Can't Keep Up with the Platform

The problem runs deeper than ignorance or inertia. The frameworks themselves increasingly struggle to work with the platform's evolution. Not because the platform features are bad, but because the framework's architectural assumptions can't accommodate them.

Consider why component libraries like Radix UI choose `<div role="dialog">` over `<dialog>`. The native `<dialog>` element manages its own state: it knows when it's open, it handles its own visibility, it controls focus internally. But React's reactivity model expects all state to live in JavaScript, flowing unidirectionally into the DOM. When a native element manages its own state, React's mental model breaks down. Keeping `isOpen` in your React state synchronized with the `<dialog>` element's actual open/closed state becomes a nightmare of refs, effects, and imperative calls. Precisely what React was supposed to eliminate.

Rather than adapt their patterns to work with stateful native elements, library authors reimplement the entire behavior in a way that fits the framework. It's architecturally easier to build a fake dialog in JavaScript than to integrate with the platform's real one.

But the conflict extends beyond architectural preferences. Even when the platform adds features that developers desperately want, frameworks can't always use them.

Accordions? The web has `<details>` and `<summary>`. Tooltips? There's `title` attribute and the emerging `popover` API. Date pickers? `<input type="date">`. Custom dropdowns? The web now supports styling `<select>` elements with `appearance: base-select` and `::picker(select)` pseudo-elements. You can even put `<span>` elements with images inside `<option>` elements now. It eliminates the need for the countless JavaScript select libraries that exist solely because designers wanted custom styling.

Frameworks encourage conditional rendering and component state, so these elements don't get rendered until JavaScript decides they should exist. The mental model is "UI appears when state changes," not "UI exists, state controls visibility." Even when the platform adds the exact features developers have been rebuilding in JavaScript for years, the ecosystem momentum means most developers never learn these features exist.

And here's the truly absurd part: even when developers *do* know about these new platform features, the frameworks themselves can't handle them. [MDN's documentation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select) for customizable `<select>` elements includes this warning: "**Some JavaScript frameworks block these features; in others, they cause hydration failures when Server-Side Rendering (SSR) is enabled.**" The platform evolved. The HTML parser now allows richer content inside `<option>` elements. But React's JSX parser and hydration system weren't designed for this. They expect `<option>` to only contain text. Updating the framework to accommodate the platform's evolution takes time, coordination, and breaking changes that teams are reluctant to make.

The web platform added features that eliminate entire categories of JavaScript libraries, but the dominant frameworks can't use those features without causing hydration errors. The stack that was supposed to make development easier now lags behind the platform it's built on.

### Routing and Forms: JavaScript All the Way Down

The browser has native routing: `<a>` tags, the History API, forward/back buttons. It has native forms: `<form>` elements, validation attributes, submit events. These work without JavaScript. They're accessible by default. They're fast.

Modern frameworks threw them out. React Router, Next.js's router, Vue Router; they intercept link clicks, prevent browser navigation, and handle routing in JavaScript. Why? Because client-side routing feels like a pure state transition: URL changes, state updates, component re-renders. No page reload. No "lost" JavaScript state.

But you've now made navigation depend on JavaScript. Ctrl+click to open in a new tab? Broken, unless you carefully re-implement it. Right-click to copy link? The URL might not match what's rendered. Accessibility tools that rely on standard navigation patterns? Confused.

Forms got the same treatment. Instead of letting the browser handle submission, validation, and accessibility, frameworks encourage JavaScript-controlled forms. Formik, React Hook Form, uncontrolled vs. controlled inputs; entire libraries exist to manage what `<form>` already does. The browser can validate `<input type="email">` instantly, with no JavaScript. But that's not *reactive* enough, so we rebuild validation in JavaScript, ship it to the client, and hope we got the logic right.

The web had these primitives. We rejected them because they didn't fit our FP-inspired mental model of "state flows through JavaScript."

## What We Lost in the Process

Progressive enhancement used to be a best practice: start with working HTML, layer on CSS for style, add JavaScript for interactivity. The page works at every level. Now, we start with JavaScript and work backwards, trying to squeeze HTML out of our component trees and hoping hydration doesn't break.

We lost built-in accessibility. Native HTML elements have roles, labels, and keyboard support by default. Custom JavaScript widgets require `aria-*` attributes, focus management, and keyboard handlers. All easy to forget or misconfigure.

We lost performance. The browser's streaming parser can render HTML as it arrives. Modern frameworks send JavaScript, parse JavaScript, execute JavaScript, then finally render. That's slower. The browser can cache CSS and HTML aggressively. JavaScript bundles invalidate on every deploy.

We lost simplicity. `<a href="/about">` is eight characters. A client-side router is a dependency, a config file, and a mental model. `<form action="/submit" method="POST">` is self-documenting. A controlled form with validation is dozens of lines of state management.

And we lost alignment with the platform. The browser vendors spend millions optimizing HTML parsing, CSS rendering, and event dispatch. We spend thousands of developer-hours rebuilding those features in JavaScript, slower.

## Why This Happened

This isn't a story of incompetence. Smart people built these tools for real reasons.

By the early 2010s, JavaScript applications had become unmaintainable. jQuery spaghetti sprawled across codebases. Two-way data binding caused cascading updates that were impossible to debug. Teams needed discipline, and functional programming offered it: pure components, immutable state, unidirectional data flow. For complex, stateful applications (like dashboards with hundreds of interactive components, real-time collaboration tools, data visualization platforms) React's model was genuinely better than manually wiring up event handlers and tracking mutations.

The FP purists weren't wrong that unpredictable mutation causes bugs. They were wrong that the solution was avoiding the platform's mutation-friendly APIs instead of learning to use them well. But in the chaos of 2013, that distinction didn't matter. React worked. It scaled. And Facebook was using it in production.

Then came the hype cycle. React dominated the conversation. Every conference had React talks. Every tutorial assumed React as the starting point. CSS-in-JS became "modern." Client-side rendering became the default. When big companies like Facebook, Airbnb, Netflix and others adopted these patterns, they became industry standards. Bootcamps taught React exclusively. Job postings required React experience. The narrative solidified: this is how you build for the web now.

The ecosystem became self-reinforcing through its own momentum. Once React dominated hiring pipelines and Stack Overflow answers, alternatives faced an uphill battle. Teams that had already invested in React by training developers, building component libraries, establishing patterns are now facing enormous switching costs. New developers learned React because that's what jobs required. Jobs required React because that's what developers knew. The cycle fed itself, independent of whether React was the best tool for any particular job.

This is where we lost the plot. Somewhere in the transition from "React solves complex application problems" to "React is how you build websites," we stopped asking whether the problems we were solving actually needed these solutions. I've watched developers build personal blogs with Next.js. Sites that are 95% static content with maybe a contact form, because that's what they learned in bootcamp. I've seen companies choose React for marketing sites with zero interactivity, not because it's appropriate, but because they can't hire developers who know anything else.

The tool designed for complex, stateful applications became the default for everything, including problems the web solved in 1995 with HTML and CSS. A generation of developers never learned that most websites don't need a framework at all. The question stopped being "does this problem need React?" and became "which React pattern should I use?" The platform's native capabilities like progressive rendering, semantic HTML, the cascade, instant navigation are now considered "old-fashioned." Reinventing them in JavaScript became "best practices."

We chased functional purity on a platform that was never designed for it. And we built complexity to paper over the mismatch.

## The Way Forward

The good news: we're learning. The industry is rediscovering the platform.

HTMX embraces HTML as the medium of exchange. Server sends HTML, browser renders it, no hydration needed. Qwik resumable architecture avoids hydration entirely, serializing only what's needed. Astro defaults to server-rendered HTML with minimal JavaScript. Remix and SvelteKit lean into web standards: forms that work without JS, progressive enhancement, leveraging the browser's cache.

These tools acknowledge what the web is: a document-based platform with powerful native capabilities. Instead of fighting it, they work with it.

This doesn't mean abandoning components or reactivity. It means recognizing that `UI = f(state)` is a useful model *inside* your framework, not a justification to rebuild the entire browser stack. It means using CSS for styling, native events for interactions, and HTML for structure and then reaching for JavaScript when you need interactivity beyond what the platform provides.

The best frameworks of the next decade will be the ones that feel like the web, not in spite of it.

## Conclusion

In chasing functional purity, we built a frontend stack that is more complex, more fragile, and less aligned with the platform it runs on. We recreated CSS in JavaScript, events in synthetic wrappers, rendering in hydration layers, and routing in client-side state machines. We did this because we wanted predictability, control, and clean abstractions.

But the web was never meant to be pure. It's a sprawling, messy, miraculous platform built on decades of emergent behavior, pragmatic compromises, and radical openness. Its mutability isn't a bug. It's the reason a document written in 1995 still renders in 2025. Its global scope isn't dangerous. It's what lets billions of pages share a design language.

Maybe the web didn't need to be purified. Maybe it just needed to be understood.
