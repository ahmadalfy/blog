---
layout: post
title:  'A select should tell you something'
codepen: false
codehighlighter: true
mermaid: false
demo: true
date: 2026-10-27 00:00:00
description: 'Customizable select isn’t just a prettier dropdown. Five before/after demos show how options can carry what people need to decide.'
image: 2026/10/og-a-select-should-tell-you-something.png
header_image: 2026/10/header-a-select-should-tell-you-something.svg
header_image_mobile: 2026/10/header-a-select-should-tell-you-something-mobile.svg
---

<div class="warning" role="note">
  <style>
    @scope { :scope { display: none; } }
    @supports not (appearance: base-select) {
      @scope {
        :scope { display: block; }
        p { margin: 0; }
      }
    }
  </style>
  <p><strong>Heads up:</strong> your browser doesn’t support customizable selects yet, so the “after” demos below look like ordinary selects. That’s also exactly what your visitors would see in this browser. To see the difference, open this page in Chrome or Edge.</p>
</div>

<style data-demo-shared>
/* Shared by every .demo in this post. Scoped, so nothing leaks onto the page. */
@scope (.demo) {
  :scope {
    --muted: #666;
    --line: #d9dbd4;
    --surface: #fff;
    --tint: #f6f7f4;
    --accent: #2a55e5;
    --amber: #b07415;
    --indigo: #3a3f9e;
    color-scheme: light;
    display: grid;
    gap: 14px;
    margin: 2em 0;
    padding: 20px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--tint);
  }
  :scope > figcaption { font-size: 0.85em; color: var(--muted); }
  .ba { display: grid; gap: 16px; }
  @media (min-width: 640px) { .ba { grid-template-columns: 1fr 1fr; align-items: start; } }
  .pane { display: grid; gap: 10px; min-inline-size: 0; padding: 16px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
  .pane-label { margin: 0; font-size: 0.8em; font-weight: 700; color: var(--muted); }
  .field { display: grid; gap: 6px; min-inline-size: 0; }
  .field-label { font-weight: 700; font-size: 0.9em; }
  select { font: inherit; inline-size: 100%; height: 44px; }
  /* Separators only exist so a native select reads well. */
  .sep { display: none; }
}
/* The customizable select, only in the "after" panes. */
@supports (appearance: base-select) {
  @scope (.after) {
    select, ::picker(select) { appearance: base-select; }
    select {
      display: flex;
      align-items: center;
      gap: 10px;
      min-block-size: 44px;
      min-inline-size: 0;
      padding: 8px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      color: inherit;
      cursor: pointer;
    }
    select:hover { border-color: #a9ada3; }
    select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    select:open { border-color: var(--accent); }
    selectedcontent { display: flex; align-items: center; gap: 10px; flex: 1; min-inline-size: 0; }
    selectedcontent .opt-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    select::picker-icon { color: var(--muted); margin-inline-start: auto; }
    select:open::picker-icon { rotate: 180deg; }
    ::picker(select) {
      margin-block: 6px;
      padding: 4px;
      min-inline-size: anchor-size(width);
      max-inline-size: min(440px, calc(100vw - 32px));
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--surface);
      box-shadow: 0 12px 32px rgb(0 0 0 / 0.14);
    }
    option { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; }
    option:hover { background: rgb(0 0 0 / 0.05); }
    option:focus-visible { outline: none; background: rgb(42 85 229 / 0.14); }
    option:checked { font-weight: 700; }
    option::checkmark { order: 1; margin-inline-start: auto; color: var(--accent); }
  }
}
@media (prefers-reduced-motion: no-preference) {
  @supports (appearance: base-select) {
    @scope (.after) {
      ::picker(select) { transition: opacity .14s, translate .14s, display .14s allow-discrete, overlay .14s allow-discrete; }
      select:not(:open)::picker(select) { opacity: 0; translate: 0 -4px; }
      select:open::picker(select) {
        @starting-style { opacity: 0; translate: 0 -4px; }
      }
      select::picker-icon { transition: rotate .14s; }
    }
  }
}
</style>

There are multiple articles about `appearance: base-select` and how you can use it. We finally can style a select. The bigger change is what an option can hold. Until now, an option was one line of plain text, so everything a person needed to decide had to fit in a label or be left out. Now an option can carry the thing people actually decide with: a preview, a number, a job title, a warning. They stop reading and working things out, and start recognising.

Below are five selects, each shown before and after. The before is what most forms do today. The after is the same `<select>`, with the same keyboard behaviour and the same form value. Only what it shows has changed. If you want the mechanics, the [Chrome team's announcement](https://developer.chrome.com/blog/a-customizable-select) and [MDN's guide](https://developer.mozilla.org/docs/Learn_web_development/Extensions/Forms/Customizable_select) cover them well.

### See it, don't imagine it

A font picker usually lists names. To choose well, you either already know what Fraunces looks like, or you pick it, look at the result, and come back to try the next one.

When each option is set in its own typeface, the option is the preview. You judge the shape, not the name.

<figure class="demo">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Fraunces:opsz,wght@9..144,500&family=IBM+Plex+Mono:wght@500&family=Literata:opsz,wght@7..72,500&family=Playfair+Display:wght@500&family=Space+Grotesk:wght@500&display=swap">
  <style>
    @scope {
      .after option { font-size: 1.1em; }
      .after option:checked { font-weight: inherit; }
      .after option:checked .opt-text { text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; }
      .after .kind { margin-inline-start: auto; font-family: 'Gentium Book Basic', serif; font-size: 0.75em; color: var(--muted); }
      .after option::checkmark { margin-inline-start: 0; }
      .after selectedcontent { font-size: 1.1em; }
      .after selectedcontent .kind { display: none; }
    }
  </style>
  <div class="ba">
    <div class="pane before">
      <p class="pane-label">Before</p>
      <label class="field">
        <span class="field-label">Heading font</span>
        <select name="font_before">
          <option value="gentium">Gentium Book Basic</option>
          <option value="fraunces" selected>Fraunces</option>
          <option value="literata">Literata</option>
          <option value="space">Space Grotesk</option>
          <option value="plex-mono">IBM Plex Mono</option>
          <option value="playfair">Playfair Display</option>
          <option value="caveat">Caveat</option>
        </select>
      </label>
    </div>
    <div class="pane after">
      <p class="pane-label">After</p>
      <label class="field">
        <span class="field-label">Heading font</span>
        <select name="font_after">
          <button><selectedcontent></selectedcontent></button>
          <option value="gentium" style="font-family: 'Gentium Book Basic', serif"><span class="opt-text">Gentium Book Basic</span><span class="sep">, </span><span class="kind">Serif</span></option>
          <option value="fraunces" selected style="font-family: 'Fraunces', serif"><span class="opt-text">Fraunces</span><span class="sep">, </span><span class="kind">Serif</span></option>
          <option value="literata" style="font-family: 'Literata', serif"><span class="opt-text">Literata</span><span class="sep">, </span><span class="kind">Serif</span></option>
          <option value="space" style="font-family: 'Space Grotesk', sans-serif"><span class="opt-text">Space Grotesk</span><span class="sep">, </span><span class="kind">Sans</span></option>
          <option value="plex-mono" style="font-family: 'IBM Plex Mono', monospace"><span class="opt-text">IBM Plex Mono</span><span class="sep">, </span><span class="kind">Mono</span></option>
          <option value="playfair" style="font-family: 'Playfair Display', serif"><span class="opt-text">Playfair Display</span><span class="sep">, </span><span class="kind">Display</span></option>
          <option value="caveat" style="font-family: 'Caveat', cursive"><span class="opt-text">Caveat</span><span class="sep">, </span><span class="kind">Handwriting</span></option>
        </select>
      </label>
    </div>
  </div>
  <figcaption>Before, you need to know what Fraunces looks like. After, you see it.</figcaption>
</figure>

This pattern is not new. We already have in document editors (like Google Docs) and in design tools (like Figma and Photoshop). It just became available for us and all we need is one inline style per option, `style="font-family: 'Fraunces', serif"`, and the closed control keeps the typeface after you choose. We are also able to show the category of each font, like Serif, Sans, Mono, Display, or Handwriting.

### Let the list do the maths

Time zone pickers tend to look like "(GMT+09:00) Tokyo". The offset is accurate and almost never what you want. What you want is the time there, so you add the offset to your own time in your head, and maybe get it wrong around midnight.

Show the current time next to each city, plus whether it's day or night, and the question answers itself before you choose.

<figure class="demo">
  <style>
    @scope {
      .sky { inline-size: 12px; block-size: 12px; border-radius: 50%; flex: none; }
      .sky.day { background: var(--amber); box-shadow: 0 0 0 3px rgb(176 116 21 / 0.25); }
      .sky.night { background: transparent; box-shadow: inset -4px -2px 0 0 var(--indigo); rotate: -20deg; }
      .after ::picker(select) { min-inline-size: max(anchor-size(width), 19rem); }
      .after option { display: grid; grid-template-columns: 12px minmax(0, 1fr) auto 1.25rem; column-gap: 10px; }
      .after option::checkmark { grid-column: 4; justify-self: end; margin: 0; }
      .time { font-variant-numeric: tabular-nums; }
      .after selectedcontent .time { margin-inline-start: auto; color: var(--muted); }
    }
  </style>
  <div class="ba">
    <div class="pane before">
      <p class="pane-label">Before</p>
      <label class="field">
        <span class="field-label">Schedule in</span>
        <select name="tz_before"></select>
      </label>
    </div>
    <div class="pane after">
      <p class="pane-label">After</p>
      <label class="field">
        <span class="field-label">Schedule in</span>
        <select name="tz_after">
          <button><selectedcontent></selectedcontent></button>
        </select>
      </label>
    </div>
  </div>
  <template>
    <option><i class="sky" aria-hidden="true"></i><span class="opt-text"></span><span class="sep">, </span><span class="time"></span></option>
  </template>
  <script>
    (() => {
      const root = document.currentScript.closest('.demo');
      const before = root.querySelector('select[name="tz_before"]');
      const after = root.querySelector('select[name="tz_after"]');
      const tpl = root.querySelector('template');
      const zones = [
        ['America/Los_Angeles', 'San Francisco'], ['America/New_York', 'New York'],
        ['Europe/London', 'London'], ['Europe/Berlin', 'Berlin'], ['Africa/Cairo', 'Cairo'],
        ['Asia/Dubai', 'Dubai'], ['Asia/Kolkata', 'Bengaluru'], ['Asia/Singapore', 'Singapore'],
        ['Asia/Tokyo', 'Tokyo'], ['Australia/Sydney', 'Sydney'],
      ];
      const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dayKey = (timeZone, d) =>
        new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
      function describe(timeZone, now) {
        const parts = Object.fromEntries(
          new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23', timeZoneName: 'shortOffset' })
            .formatToParts(now).map(p => [p.type, p.value]));
        const hour = Number(parts.hour);
        const there = dayKey(timeZone, now), here = dayKey(localZone, now);
        const when = there > here ? ' tomorrow' : there < here ? ' yesterday' : '';
        const time = new Intl.DateTimeFormat(undefined, { timeZone, hour: 'numeric', minute: '2-digit' }).format(now) + when;
        return { time, offset: parts.timeZoneName, isDay: hour >= 7 && hour < 21 };
      }
      // Replace a select's options but keep its <button><selectedcontent>.
      function setOptions(sel, opts) {
        const btn = sel.querySelector(':scope > button');
        sel.replaceChildren(...(btn ? [btn] : []), ...opts);
      }
      const isOpen = sel => { try { return sel.matches(':open'); } catch { return false; } };
      function render() {
        const now = new Date();
        const fallback = zones.some(([tz]) => tz === localZone) ? localZone : 'Africa/Cairo';
        const keepBefore = before.value || fallback;
        before.replaceChildren(...zones.map(([tz, label]) => new Option(`(${describe(tz, now).offset}) ${label}`, tz)));
        before.value = keepBefore;
        if (isOpen(after)) return; // don't rebuild the list under the pointer
        const keepAfter = after.value || fallback;
        setOptions(after, zones.map(([tz, label]) => {
          const info = describe(tz, now);
          const o = tpl.content.firstElementChild.cloneNode(true);
          o.value = tz;
          o.querySelector('.opt-text').textContent = label;
          o.querySelector('.time').textContent = info.time;
          o.querySelector('.sky').classList.add(info.isDay ? 'day' : 'night');
          return o;
        }));
        after.value = keepAfter;
      }
      render();
      setTimeout(() => { render(); setInterval(render, 60_000); }, (60 - new Date().getSeconds()) * 1000);
    })();
  </script>
  <figcaption>Before, you work out the time from the offset. After, the list tells you, and whether it’s day or night.</figcaption>
</figure>

{:.note}
This is the only demo that needs JavaScript, because the times come from `Intl.DateTimeFormat`.

### Compare at a glance

Delivery options are usually a group of radio buttons, each with its details written out as a sentence.

To be fair, radio buttons have a real strength. Every option is visible without a click, and for two or three short choices they're the right pattern. But once each option carries a few facts, the facts end up in prose. Comparing means reading every sentence and holding the numbers in your head.

A select with the facts in aligned columns turns that into a glance down a column, in the space of a single field.

<figure class="demo">
  <style>
    @scope {
      .radios { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; min-inline-size: 0; }
      .radios legend { padding: 0; margin-block-end: 6px; font-weight: 700; font-size: 0.9em; }
      .radio { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start; font-size: 0.95em; line-height: 1.4; }
      .radio input { margin-block-start: 0.3em; }
      .after ::picker(select) { min-inline-size: max(anchor-size(width), 20rem); }
      .after option { display: grid; grid-template-columns: minmax(0, 1fr) 6.5rem 4rem 1.25rem; column-gap: 10px; }
      .after option::checkmark { grid-column: 4; justify-self: end; margin: 0; }
      .when { color: var(--muted); }
      .price { justify-self: end; font-variant-numeric: tabular-nums; }
      .after option:checked .when { color: inherit; }
      .after selectedcontent .when { color: var(--muted); }
      .after selectedcontent .price { margin-inline-start: auto; font-variant-numeric: tabular-nums; }
    }
  </style>
  <div class="ba">
    <div class="pane before">
      <p class="pane-label">Before</p>
      <fieldset class="radios">
        <legend>Delivery</legend>
        <label class="radio"><input type="radio" name="delivery_before" value="sameday"><span><strong>Same-day courier</strong><br>Delivered today by 9 pm if you order before 2 pm. Costs $14.00.</span></label>
        <label class="radio"><input type="radio" name="delivery_before" value="express"><span><strong>Express</strong><br>Arrives tomorrow. $8.50, tracked.</span></label>
        <label class="radio"><input type="radio" name="delivery_before" value="standard" checked><span><strong>Standard</strong><br>Our usual service: 3 to 5 business days for $3.90.</span></label>
        <label class="radio"><input type="radio" name="delivery_before" value="pickup"><span><strong>Pickup point</strong><br>Free. Collect from a pickup point near you in 2–3 days.</span></label>
      </fieldset>
    </div>
    <div class="pane after">
      <p class="pane-label">After</p>
      <label class="field">
        <span class="field-label">Delivery</span>
        <select name="delivery_after">
          <button><selectedcontent></selectedcontent></button>
          <option value="sameday"><span class="opt-text">Same-day courier</span><span class="sep">, </span><span class="when">Today by 9 pm</span><span class="sep">, </span><span class="price">$14.00</span></option>
          <option value="express"><span class="opt-text">Express</span><span class="sep">, </span><span class="when">Tomorrow</span><span class="sep">, </span><span class="price">$8.50</span></option>
          <option value="standard" selected><span class="opt-text">Standard</span><span class="sep">, </span><span class="when">3–5 days</span><span class="sep">, </span><span class="price">$3.90</span></option>
          <option value="pickup"><span class="opt-text">Pickup point</span><span class="sep">, </span><span class="when">2–3 days</span><span class="sep">, </span><span class="price">Free</span></option>
        </select>
      </label>
    </div>
  </div>
  <figcaption>Before, the details hide in sentences and take the whole panel. After, the same choice fits in one field, with arrival and price lined up.</figcaption>
</figure>

The columns are a grid on each option:

```css
option { display: grid; grid-template-columns: 1fr 6.5rem 4rem; }
```

### Tell people apart

At a company of about two hundred people, we had two colleagues with the same name, in different departments. Whenever I had to pick one of them, I went by their job title. Photos help less than you'd think, because people often don't know what a colleague looks like, especially one in another department.

A text-only select gives you two identical options and a guess. Put the title and department under each name and they become two different answers. The closed control keeps the title too, so anyone reviewing the form can see who you picked.

<figure class="demo">
  <style>
    @scope {
      .stack { display: grid; min-inline-size: 0; }
      .role { font-size: 0.8em; font-weight: 400; color: var(--muted); }
      .after selectedcontent .stack { display: flex; align-items: baseline; gap: 8px; min-inline-size: 0; }
      .after selectedcontent .role { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
  </style>
  <div class="ba">
    <div class="pane before">
      <p class="pane-label">Before</p>
      <label class="field">
        <span class="field-label">Send the invoice to</span>
        <select name="person_before">
          <option value="am-eng">Ahmed Mostafa</option>
          <option value="am-fin">Ahmed Mostafa</option>
          <option value="mariam">Mariam Adel</option>
          <option value="youssef">Youssef Nabil</option>
          <option value="hana">Hana Sherif</option>
        </select>
      </label>
    </div>
    <div class="pane after">
      <p class="pane-label">After</p>
      <label class="field">
        <span class="field-label">Send the invoice to</span>
        <select name="person_after">
          <button><selectedcontent></selectedcontent></button>
          <option value="am-eng"><span class="stack"><span class="opt-text">Ahmed Mostafa</span><span class="sep">, </span><span class="role">Backend engineer · Engineering</span></span></option>
          <option value="am-fin" selected><span class="stack"><span class="opt-text">Ahmed Mostafa</span><span class="sep">, </span><span class="role">Accountant · Finance</span></span></option>
          <option value="mariam"><span class="stack"><span class="opt-text">Mariam Adel</span><span class="sep">, </span><span class="role">Product designer · Design</span></span></option>
          <option value="youssef"><span class="stack"><span class="opt-text">Youssef Nabil</span><span class="sep">, </span><span class="role">QA lead · Engineering</span></span></option>
          <option value="hana"><span class="stack"><span class="opt-text">Hana Sherif</span><span class="sep">, </span><span class="role">HR partner · People</span></span></option>
        </select>
      </label>
    </div>
  </div>
  <figcaption>Two people share a name. Before, you guess. After, the title and department make them two different answers, even once the list is closed.</figcaption>
</figure>

### Know before you choose

Some options come with consequences. In a plain select, you find out afterwards.

Mark those options in the list and you know while you're choosing.

<figure class="demo">
  <style>
    @scope {
      .lock { inline-size: 12px; block-size: 12px; flex: none; }
      .special-note { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 999px; font-size: 0.75em; font-weight: 700; color: #7a4f0e; background: rgb(176 116 21 / 0.14); white-space: nowrap; }
      .after option .special-note { margin-inline-start: auto; }
      .after option::checkmark { margin-inline-start: 8px; }
      .after option:not(:has(.special-note))::checkmark { margin-inline-start: auto; }
      .after selectedcontent .special-note { margin-inline-start: auto; }
    }
  </style>
  <div class="ba">
    <div class="pane before">
      <p class="pane-label">Before</p>
      <label class="field">
        <span class="field-label">Share the report with</span>
        <select name="team_before">
          <option value="engineering">Engineering</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
          <option value="finance">Finance</option>
          <option value="people">People</option>
          <option value="legal">Legal</option>
          <option value="security">Security</option>
          <option value="sales">Sales</option>
          <option value="support">Support</option>
        </select>
      </label>
    </div>
    <div class="pane after">
      <p class="pane-label">After</p>
      <label class="field">
        <span class="field-label">Share the report with</span>
        <select name="team_after">
          <button><selectedcontent></selectedcontent></button>
          <option value="engineering"><span class="opt-text">Engineering</span></option>
          <option value="design"><span class="opt-text">Design</span></option>
          <option value="marketing"><span class="opt-text">Marketing</span></option>
          <option value="finance"><span class="opt-text">Finance</span><span class="sep">, </span><span class="special-note"><svg class="lock" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/></svg>needs approval</span></option>
          <option value="people"><span class="opt-text">People</span></option>
          <option value="legal"><span class="opt-text">Legal</span><span class="sep">, </span><span class="special-note"><svg class="lock" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/></svg>needs approval</span></option>
          <option value="security"><span class="opt-text">Security</span><span class="sep">, </span><span class="special-note"><svg class="lock" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/></svg>needs approval</span></option>
          <option value="sales"><span class="opt-text">Sales</span></option>
          <option value="support"><span class="opt-text">Support</span></option>
        </select>
      </label>
    </div>
  </div>
  <figcaption>Before, you find out a team needs approval after you’ve shared. After, you know while you’re choosing.</figcaption>
</figure>

The badge appears only on the options that require special attention, and nowhere else.

### It's still a select

Every "after" in this post is a plain `<select>`. Keyboard handling, type-to-jump, form submission, `select.value`, `required`, validation and the accessible role all stay with the browser, and the control itself needs no JavaScript.

The bigger trade-off is on phones. A native select opens the operating system's own picker. It shows a scrolling wheel on iOS, a sheet on Android. Those are familiar, sized for thumbs, and tuned to each platform's accessibility features. A customizable select doesn't use them; it draws its own list on the page instead.

You don't have to pick one behaviour for everyone. Opt in only where there's a mouse or trackpad, and touch devices keep their native picker:

```css
@media (hover: hover) and (pointer: fine) {
  select,
  ::picker(select) { appearance: base-select; }
}
/* Or we can rely on the window size */
@media (min-width: 768px) {
  select,
  ::picker(select) { appearance: base-select; }
}
```

Phone users then see each option's text without the extras, which is one more reason the text has to stand on its own. The demos in this post opt in everywhere, so you can try them on any device.

### Start using it today

Customizable select is a textbook progressive enhancement. A browser that doesn't support it doesn't break. It shows a regular native select, keeps only the text of each option, and submits the same value. Nobody gets a worse form than they have today. If you're reading this in Firefox at the time of writing, the "after" demos above are exactly what your visitors would see.

That leaves one requirement, and it's good practice anyway. The text of every option has to make sense on its own. "Ahmed Mostafa, Accountant · Finance", not just a name. "Express, Tomorrow, $8.50", not three loose fragments. In the demos, small separator spans that are hidden in the customized version make the plain version read like a sentence. No polyfill needed.

<script src="https://cdn.jsdelivr.net/npm/baseline-status@1/baseline-status.min.js" type="module"></script>
<baseline-status featureId="customizable-select"></baseline-status>

So there's no reason to wait. Find the select in your product where people hesitate the most, ask what they're really trying to find out, and put that answer inside the option. Leave everything else out.
