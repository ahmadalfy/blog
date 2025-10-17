---
layout: post
title:  'The Hidden Cost of URL Design'
codepen: false
codehighlighter: true
mermaid: true
date: 2025-10-16 00:00:00
description: "URL design impacts application architecture, performance, and costs. Case study: how flat URLs caused 2x backend load and how we optimized it."
image: 2025/10/mermaid-diagram.png
---

When we architected an e-commerce platform for one of our clients, we made what seemed like a simple, user-friendly decision: use clean, flat URLs. Products would live at `/nike-air-zoom`, categories at `/shoes`, pages at `/about-us`. No prefixes, no `/product/` or `/category/` clutter. Minimalist paths that felt simple.

This decision, which was made hastily and without proper discussion, would later cost us hours spent on optimization.

The problem wasn't the URLs themselves. It was that we treated URL design as a UX decision when it's fundamentally an **architectural decision** with cascading technical implications. Every request to the application triggered two backend API calls. Every bot crawling a malformed URL hit the database twice. Every 404 was expensive.

This article isn't about URL best practices you've read a hundred times (keeping URLs short, avoiding special characters, or using hyphens instead of underscores). This is about something rarely discussed: **how your URL structure shapes your entire application architecture, performance characteristics, and operational costs.**

## The Deceptive Simplicity of "Clean URLs"

Flat URLs like `/summer-collection` or `/running-shoes` feel right. They're intuitive, readable, and align with how users think about content. No technical jargon, no hierarchy to remember. This design philosophy emerged from the SEO community's consensus that simpler URLs perform better in search rankings.

But here's what the SEO guides don't tell you: **flat URLs trade determinism for aesthetics**.

When your URL is `/leather-jacket`, your application cannot know whether you're requesting:

- A product named "Leather Jacket"
- A category called "Leather Jacket"
- A blog post titled "Leather Jacket"
- A landing page for a "Leather Jacket" campaign
- Nothing at all (a 404)

This ambiguity means your application must **ask** rather than **know**. And asking is expensive.

### The CMS Advantage: URL Resolution Tables

Many traditional CMSs solved this problem decades ago. Systems like Joomla, WordPress (to some extent), and Drupal maintain dedicated **SEF (Search Engine Friendly) URL tables** which are essentially lookup dictionaries that map clean URLs to their corresponding entity types and IDs.

When you request `/leather-jacket`, these systems do a single, fast database lookup:

```sql
SELECT entity_type, entity_id FROM url_rewrites WHERE url_path = 'leather-jacket'
```

One query, instant resolution, minimal overhead. The URL ambiguity is resolved at the database layer with an indexed lookup rather than through sequential API calls.

**But not every system works this way.** In our case, Magento's API architecture didn't expose a unified URL resolution endpoint. The frontend had to query separate endpoints for products and categories, which brings us to our problem.

### When "Clean" Becomes "Costly"

In a structured URL system (`/product/leather-jacket`), the routing decision is instant:

```javascript
path = "/product/leather-jacket"
prefix = path.split("/")[1]  // "product"
// Route to product handler immediately
```

In a flat URL system, you need a resolver:

```javascript
path = "/leather-jacket"
slug = path.split("/")[1]

// Now what? We have to ask the database...
isProduct = await checkIfProduct(slug)
if (isProduct) return renderProduct()

isCategory = await checkIfCategory(slug)
if (isCategory) return renderCategory()

return render404()
```

This might seem like a minor difference, a few extra database queries. But let's see what this actually costs at scale.

## The Two-Request Problem

Our stack for this particular client consisted of a Nuxt.js frontend (running in SSR mode) and a Magento backend. Every URL that hit the application went through this flow:

### The Original Architecture

User requests: `/nike-air-zoom`. Then, Nuxt SSR Server would query Magento API twice to confirm what the slug represented. If neither existed, it returned a 404.

<pre class="mermaid">
sequenceDiagram
    participant User
    participant Nuxt as Nuxt SSR Server
    participant Backend as Magento API

    Note over User,Backend: Every Request (Product, Category, or 404)

    User->>Nuxt: GET /running-shoes

    Note over Nuxt: Check both endpoints concurrently
    par Product Check
        Nuxt->>Backend: getProductBySlug("running-shoes")
        Backend-->>Nuxt: Not found (404)
    and Category Check
        Nuxt->>Backend: getCategoryBySlug("running-shoes")
        Backend-->>Nuxt: Category found!
    end

    Nuxt-->>User: Rendered category page
    Note over Nuxt,Backend: Total: 2 concurrent backend calls (~50ms)

    rect rgb(255, 200, 200)
        Note over User,Backend: Invalid URL Example
        User->>Nuxt: GET /invalid-page
        par Product Check
            Nuxt->>Backend: getProductBySlug("invalid-page")
            Backend-->>Nuxt: Not found (404)
        and Category Check
            Nuxt->>Backend: getCategoryBySlug("invalid-page")
            Backend-->>Nuxt: Not found (404)
        end
        Nuxt-->>User: 404 page
        Note over Nuxt,Backend: Total: 2 backend calls for nothing!
    end
</pre>

The diagram makes the inefficiency obvious:

- **Every valid page required 2 backend lookups** (one fails, one succeeds)
- **Every invalid URL triggered 2 backend lookups** (both fail)
- **Every crawler** generated 2 database queries per attempt

### The Math: Why This Compounds

Let's say we have:

- 100,000 page views per day
- 30% of traffic is bots/crawlers hitting invalid URLs
- Average API latency: 50ms per call

This will be translated to:

- **Daily backend calls:** 100,000 × 2 = 200,000 requests
- **Bot overhead:** 30,000 × 2 = 60,000 wasted requests
- **Added latency per request:** 100ms (2 × 50ms)

Now scale this during a traffic spike, say Black Friday or a major product launch. Our backend autoscaling would kick in, spinning up new instances to handle what was essentially **artificial load created by our URL design**.

### Real Impact

We observed:

- **Latency:** P95 response times during peak traffic reached 800ms-1.2s
- **Compute costs:** Backend infrastructure costs were 40% higher than projected
- **Vulnerability:** During bot attacks or crawler storms, the 2x request multiplier meant we were essentially DDoSing ourselves

The kicker? This wasn't a bug. This was the architecture working exactly as designed.

### The Collision Problem

There's another subtle issue: in systems without slug uniqueness constraints, a product and category could both use the same slug. Now your resolver doesn't just need to check what exists. It needs to decide which one to serve. Do you prioritize products? Categories? First-created wins? This ambiguity isn't just a performance problem; it's a business logic problem. If a user comes from a marketing email expecting a product but lands on a category page instead, that's a conversion lost.

### Do You Have This Problem?

You might be experiencing this issue if:

- Your application serves multiple entity types (products, categories, pages, posts) from flat URLs
- You're using a headless/API-first architecture without unified URL resolution
- Your APM/monitoring shows 2+ similar backend queries per page request
- 404 pages have similar latency to valid pages (they shouldn't)
- Bot traffic causes disproportionate backend load
- Backend autoscaling triggers don't correlate with actual user traffic patterns

If you checked 3 or more of these, keep reading. Your URLs might be costing you more than you think.

## How we solved that problem

Faced with this problem on a platform with 100k+ SKUs, we had to choose a solution that balanced performance gains with implementation reality. URL restructuring with 301 redirects would be a massive undertaking. Maintaining redirect maps for that many products, ensuring no SEO disruption, and coordinating the migration was simply too risky and resource-intensive.

Instead, we implemented a two-part solution that leveraged what we already had and made smart optimizations where it mattered most.

### Part 1: Server-Side Resolution (First Load)

We realized the Nuxt server already cached the category tree for building navigation menus. Categories don't change frequently, so this cache was stable and reliable. We modified the URL resolver to:

1. **Check cached categories first** - If the slug matches a cached category, route directly to category handler (in-memory lookup, ~1ms)
2. **Query products if not a category** - Only make one API call to check if it's a product
3. **Return 404 if neither** - No entity found, render 404 page

**Result:** We went from 2 backend calls per request to just 1 for product pages, and 0 additional calls for category pages (they already hit the cache). Categories resolved instantly, products required only one API call instead of two.

### Part 2: Client-Side Routing (Internal Navigation)

Here's the key insight: when users navigate *within* the application, we already know what they clicked on. A product card knows it's linking to a product. A category menu knows it's linking to a category.

We updated all internal links to include a simple query parameter:

```html
<!-- Product card -->
<NuxtLink :to="{ path: `/product.slug`, query: { t: 'p' } }">
  Product Name
</NuxtLink>

<!-- Category menu -->
<NuxtLink :to="{ path: `/category.slug`, query: { t: 'c' } }">
  Category Name
</NuxtLink>
```

Then in the route middleware:

```javascript
export default defineNuxtRouteMiddleware((to) => {
  const type = to.query.t

  if (type === 'p') {
    // Fetch product data directly on client-side
    return fetchProductData(to.params.slug)
  } else if (type === 'c') {
    // Fetch category data directly on client-side
    return fetchCategoryData(to.params.slug)
  }

  // No type hint - fallback to SSR resolution
  // (direct access, external links, shared URLs)
})
```

**Result:** Internal navigation happens purely on the client side with direct API calls. The server-side resolver is only used for:

- Direct URL access (user types URL or bookmarks)
- External links (social media, search engines, emails)
- First page load

Since most traffic after the initial landing is internal navigation, this reduced our server-side resolution load by approximately 70-80%.

### The Combined Impact

**Before optimization:**

- Every request: 2 backend API calls
- Average response time: 800ms-1.2s (P95)
- Backend costs: 40% over projection

**After optimization:**

- Category pages (initial load): 0 additional backend calls (cached)
- Product pages (initial load): 1 backend call (50% reduction)
- Internal navigation: 0 server-side resolution (pure client-side)
- Average response time: 200-400ms (P95)
- Backend costs: Reduced by ~35%

### Why This Worked for Us

This solution had several advantages for our specific context:

1. **No URL changes** - No redirects, no SEO impact, no user confusion
2. **Leveraged existing infrastructure** - The category cache was already there
3. **Progressive enhancement** - External/shared URLs still work perfectly (clean, no query params visible)
4. **Low implementation effort** - Mostly frontend changes, minimal backend work
5. **Immediate impact** - Deployed in one day. We didn't have to wait for any changes to backend APIs.

The query parameter approach might seem inelegant, but remember: these parameters only appear during internal navigation within the SPA. When users share links or search engines crawl, they see clean URLs like `/nike-air-zoom`. The `?t=p` only exists in the client-side routing context.

Here's how requests are handled in our optimized system:

<pre class="mermaid">
sequenceDiagram
    participant User
    participant Nuxt as Nuxt SSR Server
    participant Cache as Server Cache
    participant Backend as Magento API

    Note over User,Backend: Scenario 1: Initial Page Load (Direct Access)

    User->>Nuxt: GET /running-shoes
    Nuxt->>Cache: Check if slug exists in category cache

    alt Slug is cached category
        Cache-->>Nuxt: Category found
        Nuxt->>Backend: Fetch category data
        Backend-->>Nuxt: Category details
        Nuxt-->>User: Rendered category page
        Note over Nuxt: Total: 1 backend call
    else Slug not in cache
        Cache-->>Nuxt: Not found
        Nuxt->>Backend: Check if product exists
        alt Product exists
            Backend-->>Nuxt: Product details
            Nuxt-->>User: Rendered product page
            Note over Nuxt: Total: 1 backend call
        else Product doesn't exist
            Backend-->>Nuxt: Not found
            Nuxt-->>User: 404 page
            Note over Nuxt: Total: 1 backend call
        end
    end

    Note over User,Backend: Scenario 2: Internal Navigation (SPA)

    User->>Nuxt: Click product link<br/>/nike-air-zoom?t=p
    Note over Nuxt: Query param indicates type
    Nuxt->>Backend: Fetch product data (client-side)
    Backend-->>Nuxt: Product details
    Nuxt-->>User: Rendered product page
    Note over Nuxt: Server-side resolver bypassed
</pre>

## Design Principles for New Projects

If you're starting fresh, you have the luxury of making informed decisions before the first line of code. Here's what we wish we'd known and what we now recommend to clients.

### Principle 1: Start with Structure, Relax Later if Needed

**Default to deterministic URLs** unless you have a compelling reason not to. Good starting point:

```
/product/leather-jacket
/category/outerwear
/page/about-us
```

It's far easier to remove structure later (with redirects) than to add it. Going from `/product/shoes` to `/shoes` is a simple 301. Going the other direction means updating every existing URL, redirecting old URLs, potential SEO turbulence, and user confusion with bookmarks.

### Principle 2: Match URLs to Backend Capabilities

Before finalizing your URL scheme, ask:

**Questions to answer:**

- Does our backend provide unified URL resolution? (SEF tables, single endpoint)
- Can we query by slug across all entity types efficiently?
- What's the database query cost for "does this slug exist?"

**Decision matrix:**

- Backend has SEF tables → Flat URLs viable
- Backend has separate endpoints → Structured URLs recommended
- Backend has no resolution → Build it or use structure

### Principle 3: Budget for the Hidden Costs

When choosing flat URLs, explicitly budget for:

**Infrastructure:**

- Cache layer to store resolved slugs
- Additional backend capacity for resolution queries

**Development time:**

- Building resolution logic
- Maintaining slug uniqueness
- Implementing cache invalidation
- Debugging cache consistency issues

These aren't failures. They're the actual cost of flat URLs. If the business value (SEO, UX, brand consistency) exceeds these costs, great. But make the trade-off explicit rather than discovering it six months in.

### Principle 4: Enforce Slug Uniqueness Across Types

If you do use flat URLs, make slug uniqueness a hard constraint at the database or application level. This prevents the slug collision problem entirely. Yes, it means occasionally appending numbers, using prefixes or rejecting slugs. It's far better than ambiguous runtime behavior.

### Principle 5: Document the Decision

Whatever you choose, document *why* using an [Architecture Decision Record](/2021/01/01/adrs.html) (ADR):

```markdown
## URL Design Decision (2025-10-12)

**Choice:** Structured URLs (/product/{slug}, /category/{slug})

**Rationale:**
- Backend (Magento) has separate product/category APIs
- Expected traffic: 100k+ requests/day at launch
- Team familiarity: reduces onboarding complexity
- Caching: enables smart CDN rules

**Trade-offs accepted:**
- Slightly longer URLs

**Revisit when:**
- Backend adds unified resolution endpoint
- Traffic patterns justify optimization cost
```

Future developers (including future you) will thank you.

## Final Thoughts

We should treat URL structure as a public API contract. Like any API, URLs:

- Define how clients (users, bots, search engines) interact with your system
- Create expectations that are expensive to break
- Have performance characteristics that affect the entire stack
- Must be versioned carefully (via redirects) if changed
- Should be designed with both current and future capabilities in mind

URL structure decisions are cheapest and most flexible at the start of a project (ideally in week one) when a quick discussion can define the architecture with little cost. Once development begins, changes require some rework but are still manageable. After launch, however, even minor adjustments trigger a chain reaction involving redirects, SEO checks, and cache updates. By the time scaling issues appear, restructuring URLs becomes a complex, time-consuming, and costly endeavor. Before finalizing URLs, bring together:

- **Frontend team:** What's cleanest for users?
- **Backend team:** What can we resolve efficiently?
- **DevOps:** What are the caching implications?
- **SEO/Marketing:** What's the measurable impact?

The takeaway: invest early in thoughtful URL design to avoid expensive fixes later.
