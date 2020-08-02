---
title: Building components that extend beyond their parents containers
layout: post
codepen: true
codehighlighter: true
image: 04/og.jpg
---

Recently I was building a website for a company where I found a component that I've never built anything like before. The content of the website should lie within a fixed width container just like most of the websites out there. There was just one component that looked like this:

![Design Screenshot]({{ site.url }}/images/04/screenshot.jpg)

Building components that extend beyond their container isn't new. There are  [several](https://css-tricks.com/full-width-containers-limited-width-parents/) [techniques](https://css-tricks.com/the-inside-problem/) we use to overcome that problem but the situation I faced here was unique. The component is split into two parts. The first part is easy, simple and it respects the grid. The other part is a slider that should start from the beginning of its parent and should extend until it touches the edge of the screen.

If you've worked with sliders before, you know that sliders need to have explicit dimensions at the time of initialization in order to calculate stuff like slide dimensions, how much should the slider scroll or transform to bring the next/previous slide into the view ... etc. It may seem a little bit complicated but it isn't. Most of the sliders work this way.

So I had to find a way to determine the exact width of that component dynamically. Preferably if I can do that without JavaScript as well. So if we quickly sketched that part it should look like the following:

![Sketch]({{ site.url }}/images/04/sketch.svg)

In order to determine the width of the slider area, it should be equal to Full browser width - The content part - The area outside the grid on the left side. Let's rewrite that in CSS using [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*):

{:.line-numbers}

```css
/**
 * Full browser width: 100vw;
 * Grid width: 1200px
 * Content area: 350px (or any fixed width in pixels)
 * The space outside grid on the left side: calc((100vw - grid width) / 2)
 */

:root {
  --grid-width: 1200px;
  --content-width: 350px;
  --space-outside-grid: calc((100vw - var(--grid-width)) / 2);
}

.slider {
  width: calc(100vw - var(--content-width) - var(--space-outside-grid));
}
```

Everything should be working as expected now except for the fact that the Viewport-percentage lengths ignore the scrollbars. According to the specs they assume it doesn't exist according to [the specs](https://drafts.csswg.org/css-values-3/#viewport-relative-lengths). This will cause us some trouble if the content on the page is long enough to make the page overflow.

We need to update our equation to take the scrollbar width into consideration. Here is where JavaScript comes to the rescue. We can detect the scrollbar width by subtracting the document width (using [clientWidth](https://www.w3.org/TR/cssom-view/#dom-element-clientwidth)) from the window width (using [innerWidth](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth)).. We can set it in a CSS variable to use it dynamically in our equation like the following

{:.line-numbers}

```javascript
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.style.setProperty(
    '--scrollbar-width',
    window.innerWidth - document.documentElement.clientWidth + 'px'
  );
});
```

Now all we have to do is to update our equation like the following:

{:.line-numbers data-line="4,5,9"}

```css
:root {
  --grid-width: 1200px;
  --content-width: 350px;
  /* The space outside should have its value updated as well */
  --space-outside-grid: calc((100vw - var(--grid-width) - var(--scrollbar-width)) / 2);
}

.slider {
  width: calc(100vw - var(--content-width) - var(--space-outside-grid) - var(--scrollbar-width));
}
```

And it should be working fine with scrollbars as shown below (view results in full screen to see it):

{:.codepen data-height="240" data-theme-id="7478" data-slug-hash="ZEQgdEw" data-default-tab="result"}
See the Pen <a href='https://codepen.io/ahmadalfy/pen/ZEQgdEw'>jGkav</a> by Ahmad Alfy (<a href='https://codepen.io/ahmadalfy'>@ahmadalfy</a>) on <a href='https://codepen.io'>CodePen</a>.
