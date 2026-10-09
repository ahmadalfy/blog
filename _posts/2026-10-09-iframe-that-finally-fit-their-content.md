---
layout: post
title:  'Iframes that finally fit their content'
codepen: false
codehighlighter: true
mermaid: false
date: 2026-10-09 00:00:00
description: 'Iframes can now size themselves to their content with CSS. What it replaces, where it helps, and why the embedded page has to say yes.'
image: 2026/10/header-iframes-that-finally-fit.png
---

![Iframes that finally fit their content]({{ site.baseurl }}/images/2026/10/header-iframes-that-finally-fit.svg)

Chrome 154 lets an iframe grow to the height of its content with one line of CSS without having to measure, without messages, and without resize scripts. But the page inside the iframe has to agree to it. That catch is the most interesting part of this feature, so this article spends some time on it.

### The problem I faced

I have built many checkout pages that use a payment provider's iframe. The goal was always to have the card form feel like part of the page. The user should not notice that it comes from another website.

The iframe never helped with that. It has a fixed height. Make it too tall and you get an empty gap under the form. Make it too short and you get a scrollbar inside the page's scrollbar. On mobile, that second scrollbar is the worst thing you can show someone who is about to pay. So I kept increasing the height, testing on different phones, and increasing it again.

This is a small problem. It should have a small solution. For years it did not.

### How we used to do it

The parent page cannot look inside a cross-origin iframe. It does not know how tall the content is. So the only way was to make both pages talk to each other with JavaScript.

Inside the iframe, you measure the content and send the height to the parent:

```js
const send = () => {
  const height = document.documentElement.scrollHeight;
  parent.postMessage({ type: 'resize', height }, 'https://shop.example');
};

new ResizeObserver(send).observe(document.body);
```

In the parent page, you listen, check who sent the message, and set the height:

```js
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://pay.example') return;
  if (event.data?.type !== 'resize') return;

  document.querySelector('#payment-frame').style.height = `${event.data.height}px`;
});
```

This looks short, but it hides a lot of problems:

- **Width changes height.** On a small screen, text wraps more and the content gets taller. Every resize or phone rotation needs a new measurement.
- **Content arrives late.** Fonts, images and error messages load after the first measurement. The height is wrong until someone measures again.
- **Dynamic content.** If the page inside the iframe shows or hides elements after the initial load, the height changes and needs to be measured again.
- **More than one iframe.** If the page has several, you need IDs in every message to know which one to resize.
- **Both sides must cooperate.** If the third party does not send its height, there is nothing you can do. You go back to guessing a fixed height.

That last point did not go away with the new feature. It just moved into the browser.

### The new way

In the parent page, you add one CSS property to the iframe:

```css
.embed {
  width: 100%;
  frame-sizing: content-height;
}
```

Inside the iframe, the page opts in with a meta tag in its `<head>`. It also says which websites are allowed to size it:

```html
<meta name="responsive-embedded-sizing" content="allow-origins=https://shop.example">
```

That is all you need for content that does not change after it loads. The browser measures the content and sizes the iframe. No messages, no listeners, no origin checks in your code. The meta tag must be in the HTML from the start. Adding it later with JavaScript does not work.

If the content changes later (an error message appears, a section expands, more comments load), the page inside the iframe asks the browser to measure again:

```js
window.requestResize();
```

So JavaScript does not disappear completely. The embedded page still calls one function when its content changes. But the hard parts are gone. The browser does all of that now.

`frame-sizing` also accepts `content-width`, `content-inline-size` and `content-block-size`. For most pages, `content-height` is the one you want. You can still combine it with limits like `max-height: 80vh`.

### Where this helps

#### Payment forms

This is the use case I care about most, and it is also the one that depends most on someone else.

A payment form changes height all the time. An error appears under the card number. The user switches from card to wallet. A saved card list shows up. With `frame-sizing`, all of this could look smooth inside your checkout.

But you cannot turn it on from your side alone. You control the CSS on your checkout page. The payment provider controls the page inside the iframe. Only they can add the meta tag, list the merchant sites that are allowed, and call `requestResize()` when their form changes.

So for payments, the real question is not "does Chrome support this?" It is "does my payment provider support this?" Today, most providers either ship their own postMessage script or do nothing. If you work with one, ask them. If you build one, this is a cheap win for every merchant using you.

#### Third-party widgets

Comment sections, contact forms, newsletter sign-ups and booking widgets all have the same problem. Their height depends on the content: the number of comments, the number of fields, the validation errors. These services already control their embedded page, so adding the meta tag is easy for them. The `allow-origins` list fits well here, because they already know which customer sites embed them. I have this exact problem on this website. My contact form is a Wufoo form inside an iframe, and I set its height by hand until it looked right.

#### Multi-step forms and surveys

Each step of a form has a different height. Step one has two fields. Step three has ten. Today, you either reserve space for the tallest step or let the iframe scroll. With this feature, the form calls `requestResize()` after each step and the iframe follows.

#### Content you render yourself

This one does not need any third party. Many apps show HTML email previews, rich text previews, or code demos inside a sandboxed iframe using `srcdoc`. Here you write the embedded HTML yourself, so you can add the meta tag directly. This is probably the easiest place to start using the feature today.

### Before you ship

**Browser support.** This is Chromium-only for now. Firefox and Safari do not support it yet. Keep a fixed height as the default and switch to content sizing only where it works:

```css
.embed {
  width: 100%;
  height: 500px;
}

@supports (frame-sizing: content-height) {
  .embed {
    height: auto;
    frame-sizing: content-height;
  }
}
```

Inside the iframe, check before calling the new function. Your old postMessage code can stay as a fallback until support grows:

```js
if ('requestResize' in window) {
  window.requestResize();
}
```

**Layout shift.** The iframe loads after your page, then grows. Anything below it moves down. If the iframe is in the first screen, this can hurt your Core Web Vitals. A sensible `min-height` reduces the jump.

**Do not use `allow-origins=*` without a reason.** Letting any site read your page's height can leak information. For example, a page that is taller when the user is logged in tells the parent something about that user. List only the sites that need it. This works together with the CSP `frame-ancestors` rule, which controls who can embed you at all.

### The browser does the boring part now

For years, a simple layout need, "make this box as tall as its content", required two scripts on two websites that had to agree on a message format. Now it is one CSS property, one meta tag, and one function call when things change.

The browser side is ready in Chrome. The rest depends on the people who build the pages we embed. If you run a payment gateway, a comments service, or any widget that lives inside an iframe, add the meta tag. Your users' checkouts and pages will feel like they were built as one piece.

<script src="https://cdn.jsdelivr.net/npm/baseline-status@1/baseline-status.min.js" type="module"></script>
<baseline-status featureId="frame-sizing"></baseline-status>

I will come back to payment providers in our region specifically in a follow-up post.

### References

- [Responsive iframes in Chrome 154](https://developer.chrome.com/blog/responsive-iframes), Chrome for Developers
- [New in Chrome 154](https://developer.chrome.com/blog/new-in-chrome-154), Chrome for Developers
