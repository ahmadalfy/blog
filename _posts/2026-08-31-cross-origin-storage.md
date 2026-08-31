---
layout: post
title:  'I wanted the browser to just ship jQuery. Cross-Origin Storage came for rescue'
codepen: false
codehighlighter: true
mermaid: false
date: 2026-08-31 00:00:00
description: 'Two sites, the same 8GB model, two downloads. A look at Cross-Origin Storage, the WICG proposal for sharing big files across origins without leaking history.'
---

Early in my career I had an idea I thought was obvious. Almost every site on the web was loading jQuery. The same file, over and over, millions of times a day, across the whole internet. Why didn't Chrome just include it? Ship the file with the browser, save the world a mountain of bandwidth, move on.

Nobody I said this to was impressed, and the idea falls apart the moment you poke at it. Which version do you ship? What about the next one? Do you also ship Bootstrap, Lodash, Angular? Where does it stop?

But the instinct behind it was right. There's a proposal in the Web Platform Incubator Community Group that arrives at roughly the same destination by a much better route. It's called [Cross-Origin Storage](https://wicg.github.io/cross-origin-storage/).

### My idea was built already. We called it a CDN

The web had already solved this, in its own way. For years the standard advice was to load your libraries from a public CDN. Link jQuery from Google's copy, link Bootstrap from a shared host, and everybody wins. The browser cache was keyed on the URL. If you visited site A and site A pulled jQuery from a shared CDN, the file went into the cache. When you later visited site B, and site B pointed at the exact same URL, the browser already had it. No download.

That was the whole pitch, and it worked. Not quite "the browser ships with jQuery," but close enough in practice that it was in every performance checklist for a decade.

Two separate things killed it.

### First, we stopped shipping libraries

The SPA era arrived and we all started bundling. Webpack, Rollup, Vite. You no longer ship jQuery as a file the browser can recognise. You compile it into a single bundle along with your own code, your framework, and everything else you imported.

Then we added content hashes to the filenames, because cache busting needed to be reliable. Now every build produces a new URL. Change one line in your app and the entire bundle gets a new name and a fresh download.

And tree shaking finished the job. Your copy of a library isn't the library. It's whatever subset of it your imports happened to pull in, mangled by your minifier settings. Two sites can both depend on the exact same version of the exact same package and end up shipping bytes that don't match.

So the shared cache had nothing left to share. Before any browser changed anything, we had already built our applications so that no two sites on the web send the same file.

### Then the cache stopped being shared anyway

Safari had partitioned its cache for years. Chrome followed in [version 86](https://developer.chrome.com/blog/http-cache-partitioning), released on 6 October 2020, keying cached resources on a Network Isolation Key made up of the top-level site and the current-frame site. Firefox shipped the same idea in [version 85](https://blog.mozilla.org/security/2021/01/26/supercookie-protections/) in January 2021, partitioning the HTTP cache along with the image cache, font cache, DNS cache, connection pools and more.

A file fetched while you're on site A now lives in site A's slice of the cache. Visit site B and site B downloads its own copy, even when the URL and the bytes are identical.

The reason is that a shared cache leaks. If I run a site and want to know whether you've visited a competitor, I can load a resource only they use and time the response. Fast means it was cached, which means you were there. Chrome's own explainer for the change notes that exploits along these lines had been demonstrated in the wild, including cross-site search attacks that read your search results one string at a time.

Chrome published the impact of that change. Cache miss rate up about 3.6%, bytes loaded from the network up around 4%, First Contentful Paint up about 0.3%. They decided that was a fair price, and they were right.

So by around 2021 the trick was dead twice over. Our own build tools had made it pointless, and the browsers had removed the mechanism.

### Meanwhile the files got enormous

None of this mattered much when we were arguing about a 30KB library. It matters now.

AI models, WebAssembly modules, game engines, large web fonts. These are big files, they're publicly distributed, and they're byte-for-byte identical no matter which site asks for them. The Cross-Origin Storage spec puts the problem plainly: when two unrelated sites both depend on the same 8GB model, partitioned storage forces you to download and keep that model twice. Your bandwidth, your disk, your battery, and the network's capacity, all spent on a file you already have.

Nobody is bundling an 8GB model into their webpack output. These files ship whole and unmodified, which is exactly the property the shared cache used to depend on.

### Cross-Origin Storage

The proposal is a cache that ignores URLs completely. Files are stored and looked up by their cryptographic hash.

That single change answers the version question I couldn't answer years ago. There is no "which jQuery do we ship," because you never ask for jQuery. You ask for a specific SHA-256 digest, and the browser either has those exact bytes or it doesn't. Two sites referring to the same hash are, by definition, talking about the same file.

Reading looks like this:

```js
const hash = {
  algorithm: 'SHA-256',
  value: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
};

try {
  const handle = await navigator.crossOriginStorage.requestFileHandle(hash);
  const file = await handle.getFile();
  // Use the file.
} catch (err) {
  if (err.name === 'NotFoundError') {
    // Not available. Download it normally.
  }
}
```

You get back a `FileSystemFileHandle`, the same object the File System API already gives you, so there's no new file-handling vocabulary. Writing is the same call with `create: true`, plus an `origins` option that declares who else may see the file.

Declarative versions are being proposed too, so a `<script>` tag or a `@font-face` rule could opt in with no JavaScript at all. The idea is to hang it off the `integrity` attribute you may already be using:

```html
<script src="popular-library.js" integrity="sha256-abc123..." crossoriginstorage="*"></script>
```

Note that this syntax is illustrative only.

### The hard part isn't the storage

Sharing files across sites is easy. Sharing them without rebuilding the tracking problem that killed the shared cache is the entire engineering challenge, and it's the part of this proposal I find clever.

Every time a site asks "do you have this file?", the question is a probe. If a file is used by only three sites in the world, a "yes" tells the asker you visited one of them. You've reinvented the leak.

The proposal answers in layers.

A file is only shareable with the whole web if its hash is on a **Public Hash List**. A hash earns a place by being genuinely widespread, appearing across enough independent sites that knowing you have it says nothing about you specifically. The spec proposes governing that list across vendors, in the same spirit as the Public Suffix List. If your file isn't popular, it doesn't get listed, and other sites can't probe for it.

The browser is allowed to **lie**. The spec calls it GREASE'ing (occasionally answering "not found" for a file it actually holds). One uncertain answer poisons the whole pattern.

Your first instinct is probably that I'd just ask three times and take the majority answer, and you'd be right, which is why the noise never stands alone. The spec pairs it with rate limiting on repeated requests from one origin, and with on-device heuristics watching for hashes that look generated per user. If you can't re-probe cheaply, you can't average the noise away.

There's a limit on the dishonesty, though. The spec says a browser must not do this for gigabyte-scale files, because forcing a pointless multi-gigabyte re-download is too high a price for the privacy it buys. Which means the noise is thinnest exactly where the files are largest.

The result is, the `NotFoundError` you might get never means "this file is definitely absent." It only ever means "go fetch it from the network." Treat Cross-Origin Storage as a bonus.

### Trying it today

The proposal is a Draft Community Group Report, which means it is neither a W3C standard nor on the standards track. You can still try it. There's a [browser extension](https://chromewebstore.google.com/detail/cross-origin-storage/denpnpcgjgikjpoglpjefakmdcbmlgih) that implements the proposed API and injects it into pages, so you can build against the shape of it today.

### What I think

I like this proposal because it takes a naive instinct I had years ago, agrees with the instinct, and then does all the work I didn't know was needed. My version was answering a 30KB problem, which is exactly why nobody needed it. This one exists because sending a gigabyte to a browser apparently will become an ordinary thing to do in the age of AI.
