---
layout: post
title:  'The HTML Sanitizer API'
codepen: false
codehighlighter: true
mermaid: false
date: 2026-05-07 00:00:00
description: "The HTML Sanitizer API is a new browser feature that helps developers prevent XSS vulnerabilities by safely sanitizing HTML content."
---

There are three ways an engineer learns about Cross-Site Scripting (XSS).

The **lucky ones** learn about it through a helpful code review or a proactive security lint rule. The **diligent ones** learn about it during a security audit that catches a vulnerability before it hits production.

Then, there are the **scarred ones**. They learn about it when a live exploit hits their site. When an attacker injects a script that steals session tokens from `localStorage`, hijacks cookies, or redirects users to a phishing site. I personally joined the "scarred" club back in 2005, when an embedded Flash signature in a forum I owned turned into a security nightmare... but that's a story for another time.

In this article, we're going to explore how the browser is finally taking the burden of sanitization off our shoulders with the new **HTML Sanitizer API**.

### The Problem with `innerHTML`

To understand the solution, we have to look at the danger. In the early days of the web, `innerHTML` was the magic wand that turned strings into DOM elements.

```javascript
const container = document.getElementById('content');
const userInput = '<img src="x" onerror="alert(\'XSS\')">';
container.innerHTML = userInput;
```

The moment that code runs, the browser tries to load a non-existent image, fails, and executes the `onerror` script. Congratulations, you've just been XSS'd.

The snippet above is a classic example of how unsanitized user input can lead to XSS vulnerabilities. Attackers usually ship payloads like this through several vectors:

- **User-generated content**: Comments, reviews, or any form of user input that gets rendered on the page. Usually, these inputs are stored in a database and rendered later. If the application doesn't sanitize this input, it can lead to stored XSS vulnerabilities.
- **URL parameters**: Attackers can craft URLs with malicious payloads in query parameters. If the application reflects these parameters back into the page without proper sanitization, it can lead to reflected XSS vulnerabilities. For example, a search page that takes a query parameter and displays it on the page without sanitization can be exploited.

Historically, we solved this by pulling in [**DOMPurify**](https://github.com/cure53/dompurify). It's the de facto library for sanitizing HTML in JavaScript. It works by parsing the input string, removing any dangerous elements or attributes, and returning a safe version of the HTML.

```javascript
import DOMPurify from 'dompurify';

const container = document.getElementById('content');
const userInput = '<img src="x" onerror="alert(\'XSS\')">';
const sanitizedInput = DOMPurify.sanitize(userInput);

container.innerHTML = sanitizedInput;
```

Or if you were using React, you might have done something like the following, using `dangerouslySetInnerHTML` to render sanitized content:

```jsx
import DOMPurify from 'dompurify';

function Comment({ content }) {
    const sanitizedContent = DOMPurify.sanitize(content);
    return <div dangerouslySetInnerHTML={% raw %}{{ __html: sanitizedContent }}{% endraw %} />;
}
```

DOMPurify is a fantastic tool that excels at sanitization, but not without caveats. It ships ~23.3 kB minified (~8.71 kB gzipped), requires maintenance, and essentially repeats parsing HTML which is what the browser is already designed to do.

That last point is critical. DOMPurify-style libraries have always been a fragile approach. The parsing APIs exposed to the web don't always map cleanly to how the browser actually renders a string as HTML in the "real" DOM. Worse, these libraries have to chase the browser's evolving behavior over time because things that were once safe can turn into time-bombs the moment a new platform feature ships. That puts the maintainers in a permanent race against every browser release, and once a library reaches the size and reach of DOMPurify, that race turns into a full-time job. I imagine the maintainers will be quietly thrilled the day they get to wind it down. The browser, on the other hand, knows exactly when and how it's going to execute code. Putting sanitization inside the browser means it stays in sync with the parser by definition.

### The new HTML Sanitizer API

The web platform now includes new APIs that make parsing and sanitizing HTML much safer. The spec introduces safer ways to insert HTML into the DOM, beyond the old `innerHTML` approach.

The API gives us six methods, split into two families:

- **Safe methods**: `Element.setHTML()`, `ShadowRoot.setHTML()`, `Document.parseHTML()`. These always strip XSS-unsafe content, no matter what configuration you pass.
- **Unsafe methods**: `Element.setHTMLUnsafe()`, `ShadowRoot.setHTMLUnsafe()`, `Document.parseHTMLUnsafe()`. These do exactly what you tell them to, including allowing dangerous content if your config says so.

Let's walk through them.

### `setHTML`: The Safe Way to Insert HTML

The `setHTML` method is a new addition to the DOM API that allows developers to set HTML content in a way that is safe from XSS vulnerabilities. When you use `setHTML`, the browser automatically sanitizes the input, removing any potentially dangerous elements or attributes. It is safe by default. You still can configure it, but any configuration you pass will still not allow dangerous content to be rendered. It will **always** remove unsafe elements like `<script>` and `on*` attributes. It effectively overrides your settings if you try to be "too permissive".

The simplest possible usage doesn't even need to be configured. Just call `setHTML` with a string:

```javascript
const maliciousInput = '<img src="x" onerror="alert(\'XSS\')">';
document.getElementById('content').setHTML(maliciousInput);

// Result: <img src="x"> the onerror attribute is stripped out, preventing the XSS attack.
```

That's it. The script in the `onerror` attribute is gone because the browser handled the sanitization logic during the parsing phase, using its built-in default safe configuration. If you're curious about exactly which elements and attributes the default config allows, MDN has the [full default sanitizer configuration](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API/Default_sanitizer_configuration) documented.

#### Configurable Sanitization

When you need more control, the spec lets us define a configuration object to specify which elements and attributes are allowed or blocked. It can be a bit tricky to get the configuration right as you can accidentally specify an element in both allow and block lists, or list an attribute multiple times. The API is strict about this: if you pass an invalid configuration object, it will throw a `TypeError`. This is to ensure that developers are aware of any contradictions or redundancies in their configuration.

Let's take a look at an *allow-list* configuration:

```javascript
const config = {
  elements: ["em", "strong", "b", "i", "ul", "li"],
  attributes: ["id"],
  replaceWithChildrenElements: ["span", "div"],
};
const customSanitizer = new Sanitizer(config);
```

The configuration above only allows a specific set of elements and attributes. Anything not in the allow list is stripped out. The `replaceWithChildrenElements` option lets you specify elements that should be replaced with their children instead of being removed entirely. So if a `<div>` shows up in the input, the `<div>` itself is dropped but its content stays.

Now a *block-list* configuration:

```javascript
const config = {
  removeElements: ["span", "script"],
  removeAttributes: ["lang", "id", "class", "style"],
  comments: false,
};
const customSanitizer = new Sanitizer(config);
```

This configuration specifies elements and attributes that should be removed from the input. The `comments` option controls whether HTML comments are preserved. In this example, they're removed.

You cannot have both `elements` and `removeElements` in the same configuration object, as they serve opposite purposes. The same applies to `attributes` and `removeAttributes`. If you try to include both, the API throws a `TypeError`. You *can* combine `elements` with `removeAttributes`, or `removeElements` with `attributes`, just not opposing pairs at the same level.

Notice that in both examples, we didn't have to worry about dangerous attributes like inline event handlers (`on*`). This is what "safe by default" means. Even if you configure `setHTML` to allow certain elements or attributes, it will still block anything that could lead to an XSS vulnerability.

### `setHTMLUnsafe`: The Escape Hatch

`setHTMLUnsafe` is the unsafe sibling. The cleanest way to think about the difference is this:

- With `setHTML`, your config is a *further restriction* on top of safe defaults. Unsafe stuff is **always** stripped, even if you explicitly allow it.
- With `setHTMLUnsafe`, your config is the *complete rule*. If you say allow `onclick`, `onclick` stays. Pass no config at all, and **nothing** is sanitized.

There are two main reasons to reach for it:

1. **Declarative shadow roots.** `setHTML` strips them as part of its safe defaults, so if you need them, `setHTMLUnsafe` is currently the only way.
2. **Allowing specific "unsafe" attributes intentionally.** Sometimes you genuinely need an inline handler or similar, and you want to opt in to exactly that one thing while still cleaning up the rest.

Here's the contrast in code:

```javascript
const input = "<img src=x onclick=alert('onclick') onerror=alert('onerror')>";

// setHTMLUnsafe with a custom config: onclick is allowed, onerror is still stripped
// (because we didn't list it in the config, not because the API enforces safety).
const lessSafeConfig = new Sanitizer({
  attributes: ["onclick"],
});
document.getElementById('output').setHTMLUnsafe(input, { sanitizer: lessSafeConfig });
```

`onerror` is removed because our allow-list doesn't include it, **not** because `setHTMLUnsafe` enforces any safety on its own. If we'd written `attributes: ["onclick", "onerror"]`, both would have made it through. With `setHTML`, that wouldn't matter. `onerror` would be stripped regardless.

### `parseHTML` and `parseHTMLUnsafe`: Sanitize Without Inserting

Sometimes you don't want to insert HTML immediately. You want to parse it, inspect it, maybe transform it, and only then decide what to do with it. That's what `Document.parseHTML()` and `Document.parseHTMLUnsafe()` are for.

```javascript
const untrustedHTML = '<p>Hello <script>alert("xss")</script>world</p>';

// Returns a sanitized Document you can inspect, walk, or extract from
const doc = Document.parseHTML(untrustedHTML);
console.log(doc.body.innerHTML); // <p>Hello world</p>
```

`parseHTML` follows the same rules as `setHTML`; XSS-unsafe content is always stripped. `parseHTMLUnsafe` is its counterpart and behaves like `setHTMLUnsafe`; no sanitization unless you pass a sanitizer.

This is particularly useful for things like building a sanitized `DocumentFragment` once and reusing it, or running checks on the sanitized output before deciding whether to render it at all.

### Real-World Use Cases

First, let's be clear that even with the new API, **backend sanitization is non-negotiable**. Client-side sanitization is for the **user's experience** and immediate safety. Anyone with sufficient knowledge can easily bypass your client-side code by calling your API directly. This is exactly like how we validate user input on the client for better UX, but still validate on the server for business logic and security.

In ShopTalkShow, [episode 704](https://shoptalkshow.com/704), Dave Rupert and Chris Coyier invited [Frederik Braun](https://frederikbraun.de/) from Mozilla to talk about the HTML Sanitizer API. They discussed using Sanitizer API for **Optimistic UI**; the hot pattern in frontend development.

In a comment section, when a user hits "Post", we usually rely on the backend to sanitize the comment, return it back to the browser, then render the response. This takes time and creates a less-than-optimal experience. Trusting raw user input and rendering it immediately can be risky, but with the new API, we can safely render the comment immediately while the backend is still processing. The result is a much smoother UX without compromising security.

```tsx
import React, { useState, useRef, useEffect } from 'react';

type Comment = { id: number; content: string };

const sanitizerConfig = { elements: ["b", "i", "em", "ul", "li"] };
const sanitizer = new Sanitizer(sanitizerConfig);

function CommentItem({ html }: { html: string }) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if ('setHTML' in ref.current) {
      ref.current.setHTML(html, { sanitizer });
    } else {
      // Fallback for browsers without the API yet, ship DOMPurify,
      // or render a loading indicator until the sanitized response
      // comes back from the server.
      ref.current.textContent = html;
    }
  }, [html]);

  return <li ref={ref} />;
}

const CommentSection = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  const handleSubmit = (userInput: string) => {
    // 1. Optimistic update - render immediately, safely
    const newComment = { id: Date.now(), content: userInput };
    setComments((prev) => [...prev, newComment]);

    // 2. Post to backend (still the source of truth)
    postComment(userInput);
  };

  return (
    <ul>
      {comments.map((comment) => (
        <CommentItem key={comment.id} html={comment.content} />
      ))}
    </ul>
  );
};
```

A few things worth calling out in that example:

- The `Sanitizer` is constructed once at module scope, not inside the component. Constructing it on every render is wasteful.
- The actual `setHTML` call is wrapped in a `useEffect` with feature detection, so the component degrades gracefully on browsers that haven't shipped the API yet.
- We hand the `<li>` over to imperative DOM via the ref instead of mixing `dangerouslySetInnerHTML` with React's diffing. That combo tends to cause hydration headaches.

This is the kind of place `setHTML` really shines. You can't `dangerouslySetInnerHTML` an unsanitized string without inviting an XSS, and the API gives you a path that's both ergonomic *and* safe.

There are plenty of other places where the API earns its keep:

- **WYSIWYG editors.** Users routinely write content in word processors and paste it in, dragging along massive, dirty HTML and inline styles. Listening to the `paste` event and running it through `setHTML` cleans things up before insertion.
- **Live Markdown previews.** When the input never even leaves the browser, you still want to sanitize the rendered HTML before showing it.
- **External feeds.** RSS, syndicated content, embedded snippets and anything coming from outside your origin should be sanitized before it touches the DOM.

### Wrapping Up

The HTML Sanitizer API is a significant step forward in making web development safer and more efficient. It moves security from a "library concern" to a "platform primitive". With that, we get better performance, smaller bundle sizes, and a more secure default behavior.

At the time of writing (May 2026), browser support is still early. Firefox 148 shipped the standardized API in February 2026 becoming the first browser to do so. Chrome has it in Canary behind a flag, and Safari hasn't started implementation work yet, though the team has signaled a positive position. The feature is **not yet Baseline**, which means production usage today still needs feature detection and a fallback (DOMPurify is still the right backup).

The live status of the feature is shown below.

<script src="https://cdn.jsdelivr.net/npm/baseline-status@1/baseline-status.min.js" type="module"></script>
<baseline-status featureId="sanitizer"></baseline-status>
<baseline-status featureId="parse-html-unsafe"></baseline-status>

Thankfully, the web has always allowed us to use features before they become fully standardized or available. Use it as a progressive enhancement now, and keep an eye on the support tables. The day this becomes Baseline is the day a lot of bundles get a little smaller and a lot of apps get a little safer.
