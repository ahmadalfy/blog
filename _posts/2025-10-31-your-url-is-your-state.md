---
layout: post
title:  'Your URL Is Your State'
codepen: false
codehighlighter: true
mermaid: true
date: 2025-10-31 00:00:00
description: "A deep dive into how thoughtful URL design can enhance usability, shareability, and performance. Learn what state belongs in URLs, common pitfalls to avoid, and practical patterns for modern web apps."
---

Couple of weeks ago when I was publishing [The Hidden Cost of URL Design](/2025/10/16/hidden-cost-of-url-design.html) I needed to add SQL syntax highlighting. I headed to [PrismJS](https://prismjs.com/) website trying to remember if it should be added as a plugin or what. I was overwhelmed with the amount of options in the download page so I headed back to my code. I checked the file for PrismJS and at the top of the file, I found a comment containing a URL:

```javascript
/* https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript+bash+css-extras+markdown+scss+sql&plugins=line-highlight+line-numbers+autolinker */
```

I had completely forgotten about this. I clicked the URL, and it was the PrismJS download page with every checkbox, dropdown, and option pre-selected to match my exact configuration. Themes chosen. Languages selected. Plugins enabled. Everything, perfectly reconstructed from that single URL.

It was one of those moments where something you once knew suddenly clicks again with fresh significance. Here was a URL doing far more than just pointing to a page. It was storing state, encoding intent, and making my entire setup shareable and recoverable. No database. No cookies. No localStorage. Just a URL.

This got me thinking: how often do we, as frontend engineers, overlook the URL as a state management tool? We reach for all sorts of abstractions to manage state such as global stores, contexts, and caches while ignoring one of the web's most elegant and oldest features: the humble URL.

In my previous article, I wrote about the [hidden costs of bad URL design](/2025/10/16/hidden-cost-of-url-design.html). Today, I want to flip that perspective and talk about the immense value of _good_ URL design. Specifically, how URLs can be treated as first-class state containers in modern web applications.

## The Overlooked Power of URLs

Scott Hanselman famously said “[URLs are UI](https://www.hanselman.com/blog/urls-are-ui)” and he's absolutely right. URLs aren't just technical addresses that browsers use to fetch resources. They're interfaces. They're part of the user experience.

But URLs are more than UI. They're **state containers**. Every time you craft a URL, you're making decisions about what information to preserve, what to make shareable, and what to make bookmarkable.

Think about what URLs give us for free:

* **Shareability**: Send someone a link, and they see exactly what you see
* **Bookmarkability**: Save a URL, and you've saved a moment in time
* **Browser history**: The back button just works
* **Deep linking**: Jump directly into a specific application state

URLs make web applications resilient and predictable. They're the web's original state management solution, and they've been working reliably since 1991. The question isn't whether URLs _can_ store state. It's whether we're using them to their full potential.

Before we dive into examples, let's break down how URLs encode state. Here's a typical stateful URL:

<figure>
  <img src="{{site.url}}/images/2025/10/mdn-url-all.png" alt="Anatomy of URL">
  <figcaption><em>Anatomy of a URL - Source: <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL">What is a URL - MDN Web Docs</a></em></figcaption>
</figure>

{:.note}
> For many years, these were considered the only components of a URL. That changed with the introduction of [Text Fragments](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment/Text_fragments), a feature that allows linking directly to a specific piece of text within a page. You can read more about it in my article [Smarter than ‘Ctrl+F': Linking Directly to Web Page Content](/2024/10/19/linking-directly-to-web-page-content.html).

Different parts of the URL encode different types of state:

1. Path Segments (`/path/to/myfile.html`). Best used for **hierarchical resource navigation**:
    * `/users/123/posts` - User 123's posts
    * `/docs/api/authentication` - Documentation structure
    * `/dashboard/analytics` - Application sections
2. Query Parameters (`?key1=value1&key2=value2`). Perfect for **filters**, **options**, and **configuration**:
    * `?theme=dark&lang=en` - UI preferences
    * `?page=2&limit=20` - Pagination
    * `?status=active&sort=date` - Data filtering
    * `?from=2025-01-01&to=2025-12-31` - Date ranges
3. Anchor (`#SomewhereInTheDocument`). Ideal for client-side navigation and page sections:
    * `#L20-L35` - GitHub line highlighting
    * `#features` - Scroll to section
    * `#/dashboard` - Single-page app routing (though it's rarely used these days)

### Common Patterns That Work for Query Parameters

#### Multiple values with delimiters

Sometimes you'll see multiple values packed into a single key using delimiters like commas or plus signs. It's compact and human-readable, though it requires manual parsing on the server side.

```url
?languages=javascript+typescript+python
?tags=frontend,react,hooks
```

#### Nested or structured data

Developers often encode complex filters or configuration objects into a single query string. A simple convention uses key–value pairs separated by commas, while others serialize JSON or even Base64-encode it for safety.

```url
?filters=status:active,owner:me,priority:high
?config=eyJyaWNrIjoicm9sbCJ9==  (base64-encoded JSON)
```

#### Boolean flags

For flags or toggles, it's common to pass booleans explicitly or to rely on the key's presence as truthy. This keeps URLs shorter and makes toggling features easy.

```url
?debug=true&analytics=false
?mobile  (presence = true)
```

#### Arrays (Bracket notation)

```url
?tags[]=frontend&tags[]=react&tags[]=hooks
```

Another old pattern is **bracket notation**, which represents arrays in query parameters. It originated from early web frameworks like PHP where appending `[]` to a parameter name signals that multiple values should be grouped together.

```url
?tags[]=frontend&tags[]=react&tags[]=hooks
?ids[0]=42&ids[1]=73
```

Many modern frameworks and parsers (like Node's `qs` library or Express middleware) still recognize this pattern automatically. However, it's not officially standardized in the URL specification, so behavior can vary depending on the server or client implementation. Notice how it even breaks the syntax highlighting on my website.

**The key is consistency**. Pick patterns that make sense for your application and stick with them.

## State via URL Parameters

Let's look at real-world examples of URLs as state containers:

**PrismJS Configuration**

```url
https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript&plugins=line-numbers
```

The entire syntax highlighter configuration encoded in the URL. Change anything in the UI, and the URL updates. Share the URL, and someone else gets your exact setup. This one uses anchor and not query parameters, but the concept is the same.

**GitHub Line Highlighting**

```url
https://github.com/zepouet/Xee-xCode-4.5/blob/master/XeePhotoshopLoader.m#L108-L136
```

It links to a specific file while highlighting lines 108 through 136. Click this link anywhere, and you'll land on the exact code section being discussed.

**Google Maps**

```url
https://www.google.com/maps/@22.443842,-74.220744,19z
```

Coordinates, zoom level, and map type all in the URL. Share this link, and anyone can see the exact same view of the map.

**Figma and Design Tools**

```url
https://www.figma.com/file/abc123/MyDesign?node-id=123:456&viewport=100,200,0.5
```

Before shareable design links, finding an updated screen or component in a large file was a chore. Someone had to literally _show you_ where it lived, scrolling and zooming across layers. Today, a Figma link carries all that context like canvas position, zoom level, selected element. Literally everything needed to drop you right into the workspace.

**E-commerce Filters**

```url
https://store.com/laptops?brand=dell+hp&price=500-1500&rating=4&sort=price-asc
```

This is one of the most common real-world patterns you'll encounter. Every filter, sort option, and price range preserved. Users can bookmark their exact search criteria and return to it anytime. Most importantly, they can come back to it after navigating away or refreshing the page.

## Frontend Engineering Patterns

Before we discuss implementation details, we need to establish a clear guideline for what should go into the URL. Not all state belongs in URLs. Here's a simple heuristic:

**Good candidates for URL state:**

* Search queries and filters
* Pagination and sorting
* View modes (list/grid, dark/light)
* Date ranges and time periods
* Selected items or active tabs
* UI configuration that affects content
* Feature flags and A/B test variants

**Poor candidates for URL state:**

* Sensitive information (passwords, tokens, PII)
* Temporary UI states (modal open/closed, dropdown expanded)
* Form input in progress (unsaved changes)
* Extremely large or complex nested data
* High-frequency transient states (mouse position, scroll position)

If you are not sure if a piece of state belongs in the URL, ask yourself: If someone else clicking this URL, should they see the same state? If so, it belongs in the URL. If not, use a different state management approach.

### Implementation using Plain JavaScript

The modern [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) API makes URL state management straightforward:

```javascript
// Reading URL parameters
const params = new URLSearchParams(window.location.search);
const view = params.get('view') || 'grid';
const page = params.get('page') || 1;

// Updating URL parameters
function updateFilters(filters) {
  const params = new URLSearchParams(window.location.search);

  // Update individual parameters
  params.set('status', filters.status);
  params.set('sort', filters.sort);

  // Update URL without page reload
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);

  // Now update your UI based on the new filters
  renderContent(filters);
}

// Handling back/forward buttons
window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search);
  const filters = {
    status: params.get('status') || 'all',
    sort: params.get('sort') || 'date'
  };
  renderContent(filters);
});
```

The [`popstate`](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event) event fires when the user navigates with the browser's Back or Forward buttons. It lets you restore the UI to match the URL, which is essential for keeping your app's state and history in sync. Usually your framework's router handles this for you, but it's good to know how it works under the hood.

### Implementation using React

React Router and Next.js provide hooks that make this even cleaner:

```javascript
import { useSearchParams } from 'react-router-dom';
// or for Next.js 13+: import { useSearchParams } from 'next/navigation';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read from URL (with defaults)
  const color = searchParams.get('color') || 'all';
  const sort = searchParams.get('sort') || 'price';

  // Update URL
  const handleColorChange = (newColor) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('color', newColor);
      return params;
    });
  };

  return (
    <div>
      <select value={color} onChange={e => handleColorChange(e.target.value)}>
        <option value="all">All Colors</option>
        <option value="silver">Silver</option>
        <option value="black">Black</option>
      </select>

      {/* Your filtered products render here */}
    </div>
  );
}
```

### Best Practices for URL State Management

Now that we've seen how URLs can hold application state, let's look at a few best practices that keep them clean, predictable, and user-friendly.

#### Handling Defaults Gracefully

Don't pollute URLs with default values:

```url
// Bad: URL gets cluttered with defaults
?theme=light&lang=en&page=1&sort=date

// Good: Only non-default values in URL
?theme=dark  // light is default, so omit it
```

Use defaults in your code when reading parameters:

```javascript
function getTheme(params) {
  return params.get('theme') || 'light'; // Default handled in code
}
```

#### Debouncing URL Updates

For high-frequency updates (like search-as-you-type), debounce URL changes:

```javascript
import { debounce } from 'lodash';

const updateSearchParam = debounce((value) => {
  const params = new URLSearchParams(window.location.search);
  if (value) {
    params.set('q', value);
  } else {
    params.delete('q');
  }
  window.history.replaceState({}, '', `?${params.toString()}`);
}, 300);

// Use replaceState instead of pushState to avoid flooding history
```

#### pushState vs. replaceState

When deciding between `pushState` and `replaceState`, think about how you want the browser history to behave. `pushState` creates a new history entry, which makes sense for **distinct navigation actions** like changing filters, pagination, or navigating to a new view — users can then use the Back button to return to the previous state. On the other hand, `replaceState` updates the current entry without adding a new one, making it ideal for **refinements** such as search-as-you-type or minor UI adjustments where you don't want to flood the history with every keystroke.

## URLs as Contracts

When designed thoughtfully, URLs become more than just state containers. They become **contracts** between your application and its consumers. A good URL defines expectations for humans, developers, and machines alike

### Clear Boundaries

A well-structured URL draws the line between what's public and what's private, client and server, shareable and session-specific. It clarifies where state lives and how it should behave. Developers know what's safe to persist, users know what they can bookmark, and machines know whats worth indexing.

URLs, in that sense, act as **interfaces**: visible, predictable, and stable.

### Communicating Meaning

Readable URLs explain themselves. Consider the difference between the two URLs below.

```url
https://example.com/p?id=x7f2k&v=3
https://example.com/products/laptop?color=silver&sort=price
```

The first one hides intent. The second tells a story. A human can read it and understand what they're looking at. A machine can parse it and extract meaningful structure.

Jim Nielsen calls these “[examples of great URLs](https://blog.jim-nielsen.com/2023/examples-of-great-urls/)”. URLs that explain themselves.

### Caching and Performance

URLs are cache keys. Well-designed URLs enable better caching strategies:

* Same URL = same resource = cache hit
* Query params define cache variations
* CDNs can cache intelligently based on URL patterns

You can even visualize a user's journey without any extra tracking code:

<pre class="mermaid">
graph LR
  A["/products"] --> |selects category| B["/products?category=laptops"]
  B --> |adds price filter| C["/products?category=laptops&price=500-1000"]

  style A fill:#e9edf7,stroke:#455d8d,stroke-width:2px;
  style B fill:#e9edf7,stroke:#455d8d,stroke-width:2px;
  style C fill:#e9edf7,stroke:#455d8d,stroke-width:2px;
</pre>

Your analytics tools can track this flow without additional instrumentation. Every URL parameter becomes a dimension you can analyze.

### Versioning and Evolution

URLs can communicate API versions, feature flags, and experiments:

```url
?v=2                   // API version
?beta=true             // Beta features
?experiment=new-ui     // A/B test variant
```

This makes gradual rollouts and backwards compatibility much more manageable.

## Anti-Patterns to Avoid

Even with the best intentions, it's easy to misuse URL state. Here are common pitfalls:

### “State Only in Memory” SPAs

The classic single-page app mistake:

```javascript
// User hits refresh and loses everything
const [filters, setFilters] = useState({});
```

If your app forgets its state on refresh, you're breaking one of the web's fundamental features. Users expect URLs to preserve context. I remember a viral video from years ago where a Reddit user vented about an e-commerce site: every time she hit “Back,” all her filters disappeared. Her frustration summed it up perfectly. If users lose context, they lose patience.

### Sensitive Data in URLs

This one seems obvious, but it's worth repeating:

```url
// NEVER DO THIS
?password=secret123
```

URLs are logged everywhere: browser history, server logs, analytics, referrer headers. Treat them as public.

### Inconsistent or Opaque Naming

```url
// Unclear and inconsistent
?foo=true&bar=2&x=dark

// Self-documenting and consistent
?mobile=true&page=2&theme=dark
```

Choose parameter names that make sense. Future you (and your team) will thank you.

### Overloading URLs with Complex State

```url
?config=eyJtZXNzYWdlIjoiZGlkIHlvdSByZWFsbHkgdHJpZWQgdG8gZGVjb2RlIHRoYXQ_IiwiZmlsdGVycyI6eyJzdGF0dXMiOlsiYWN0aXZlIiwicGVuZGluZyJdLCJwcmlvcml0eSI6WyJoaWdoIiwibWVkaXVtIl0sInRhZ3MiOlsiZnJvbnRlbmQiLCJyZWFjdCIsImhvb2tzIl0sInJhbmdlIjp7ImZyb20iOiIyMDI0LTAxLTAxIiwidG8iOiIyMDI0LTEyLTMxIn19LCJzb3J0Ijp7ImZpZWxkIjoiY3JlYXRlZEF0Iiwib3JkZXIiOiJkZXNjIn0sInBhZ2luYXRpb24iOnsicGFnZSI6MSwibGltaXQiOjIwfX0==
```

If you need to base64-encode a massive JSON object, the URL probably isn't the right place for that state.

### URL Length Limits

Browsers and servers impose practical limits on URL length (usually between 2,000 and 8,000 characters) but the reality is more nuanced. As [this detailed Stack Overflow answer](https://stackoverflow.com/a/417184/497828) explains, limits come from a mix of browser behavior, server configurations, CDNs, and even search engine constraints. If you're bumping against them, it's a sign you need to rethink your approach.

### Breaking the Back Button

```javascript
// Replacing state incorrectly
history.replaceState({}, '', newUrl); // Used when pushState was needed
```

Respect browser history. If a user action should be “undoable” via the back button, use `pushState`. If it's a refinement, use `replaceState`.

## Closing Thought

That PrismJS URL reminded me of something important: good URLs don't just point to content. They describe a conversation between the user and the application. They capture intent, preserve context, and enable sharing in ways that no other state management solution can match.

We've built increasingly sophisticated state management libraries like Redux, MobX, Zustand, Recoil and others. They all have their place but sometimes the best solution is the one that's been there all along.

In my previous article, I wrote about the hidden costs of bad URL design. Today, we've explored the flip side: the immense value of good URL design. URLs aren't just addresses. They're state containers, user interfaces, and contracts all rolled into one.

If your app forgets its state when you hit refresh, you're missing one of the web's oldest and most elegant features.
