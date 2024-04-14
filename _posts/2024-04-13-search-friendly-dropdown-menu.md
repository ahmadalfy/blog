---
layout: post
title:  "Search friendly dropdown menu"
codepen: false
codehighlighter: true
date: 2024-04-13 00:00:00
---

Dropdown menus have been around for a long time. They are a common way to build navigation menus with a lot of items. When these kind of menus were first introduced, we relied on JavaScript to make them work ([Suckerfish menus](https://alistapart.com/article/dropdowns/) anyone?). This is because the `:hover` pseudo-class was not supported on non-interactable elements (like `li`) in older browsers. That's not the case anymore, and we can now build dropdown menus that work without JavaScript.

After the introduction of the `:focus-within` pseudo-class, we can now build dropdown menus that work better with keyboard navigation. This is because the `:focus-within` pseudo-class is triggered when an element or its child elements are focused. This means that when a user tabs to a child menu, the dropdown menu will be shown. This was a great improvement for accessibility and usability.

## The problem

I recently had a thought about how we can make dropdown menus even more user friendly. This thought came to me after an encounter with a Wordpress administration panel that had a lot of dropdown menus. I heavily rely on the search-in-page feature in my browser. Wordpress dropdown menus are not hidden from the search-in-page feature because they are implemented with a positioning technique that puts them outside of the viewport. This means that the search-in-page feature will find the dropdown menu items, but the user will not see them. This caused me a lot of frustration as I was trying to juggle between the different results I was getting.

## The solution

I have posted about the `hidden` attribute's value `until-found` before on [HTMHell Advent's Calendar for 2023](https://www.htmhell.dev/adventcalendar/2023/11/) and I thought that this could be a great solution for this problem. The `hidden` attribute with the value `until-found` will hide the element from the user until the user searches for the element. This means that the search-in-page feature will find the element, but the user will not see it until they search for it.

**Note**: At the <time datetime="2024-04-13">time</time> of writing this post, the `hidden` attribute with the value `until-found` is an experimental feature that's currently supported on [Chrome and Edge](https://caniuse.com/mdn-html_global_attributes_hidden_until-found_value).

Let's take a look at this basic dropdown menu. We will create a two-level dropdown menu using unordered lists. The second level will be hidden using the CSS property `display: none;`. We will then use the `:hover` pseudo-class and `:focus-within` to show the second level when the first level is hovered or focused.

```html

<nav>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li>
      <a href="#">Shop</a>
      <ul>
        <li><a href="#">Electronics</a></li>
        <li><a href="#">Fashion</a></li>
        <li><a href="#">Home & Furniture</a></li>
        <li><a href="#">Health & Beauty</a></li>
        <li><a href="#">Sports & Outdoors</a></li>
      </ul>
    </li>
    <li>
      <a href="#">Services</a>
      <ul>
        <li><a href="#">Web Design</a></li>
        <li><a href="#">Web Development</a></li>
        <li><a href="#">Graphic Design</a></li>
        <li><a href="#">Digital Marketing</a></li>
        <li><a href="#">SEO</a></li>
      </ul>
    </li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>

```

```css

nav {
  min-width: fit-content;
}

nav ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

nav li {
  position: relative;
  padding: 10px 20px;
}

nav a {
  color: #fff;
  text-decoration: none;
}

nav > ul {
  display: flex;
  justify-content: space-around;
  background-color: #333;
  border-radius: 5px;
}

nav > ul > li > ul {
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  background-color: #333;
  display: none;
}

nav > ul > li:hover > ul,
nav > ul > li:focus-within > ul {
  display: block;
}

nav > ul > li > ul > li:hover,
nav > ul > li > ul > li:focus-within {
  background-color: #555;
}

```

Moving your mouse over the "Shop" or "Services" menu items will show the second level of the dropdown menu.

<iframe title="Dropdown menu" scrolling="no" loading="lazy" style="height:400px; width: 100%; border:1px solid black; border-radius:5px;" src="https://v26.livecodes.io/?x=id/jz8ap4ipegs&embed=true">
  See the project <a href="https://v26.livecodes.io/?x=id/jz8ap4ipegs" target="_blank">Dropdown menu</a> on <a href="https://livecodes.io" target="_blank">LiveCodes</a>.
</iframe>

Now let's make a few changes to make that menu work using the new `hidden` attribute value `until-found`.

{:.line-numbers data-line="7,17"}

```html
<nav>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li>
      <a href="#">Shop</a>
      <ul hidden="until-found">
        <li><a href="#">Electronics</a></li>
        <li><a href="#">Fashion</a></li>
        <li><a href="#">Home & Furniture</a></li>
        <li><a href="#">Health & Beauty</a></li>
        <li><a href="#">Sports & Outdoors</a></li>
      </ul>
    </li>
    <li>
      <a href="#">Services</a>
      <ul hidden="until-found">
        <li><a href="#">Web Design</a></li>
        <li><a href="#">Web Development</a></li>
        <li><a href="#">Graphic Design</a></li>
        <li><a href="#">Digital Marketing</a></li>
        <li><a href="#">SEO</a></li>
      </ul>
    </li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

We will have to modify the CSS as well. The way we're hiding the second level of the dropdown menu is by setting the `display` property to `none`. This is how the hidden attribute works by default. With the new `hidden` attribute value `until-found`, the content is hidden using the `content-visibility` property. To understands the difference between the two, I recommend checking this awesome [article](https://web.dev/articles/content-visibility#hiding_content_with_content-visibility_hidden) on web.dev. Now that the hidden attribute is set, the content will be hidden by default. We will need to modify the CSS to show the content when the user move their cursor over the first level of the dropdown menu.

{:.line-numbers data-line="6,7,11,12"}

```css
nav > ul > li > ul {
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  background-color: #333;
  /* Remove the following */
  /* display: none; */
}

nav > ul > li:hover > ul,
nav > ul > li:focus-within > ul {
  /* display: block; */
  content-visibility: visible;
}
```

Here is the modified version.

<iframe title="Dropdown menu" scrolling="no" loading="lazy" style="height:400px; width: 100%; border:1px solid black; border-radius:5px;" src="https://v26.livecodes.io/?x=id/ay7b7h8deq8&embed=true">
  See the project <a href="https://v26.livecodes.io/?x=id/ay7b7h8deq8" target="_blank">Dropdown menu</a> on <a href="https://livecodes.io" target="_blank">LiveCodes</a>.
</iframe>

Now try to search for "Electronics" using the search-in-page feature in your browser. You will see that the dropdown menu will open spontaneously! This is all working without JavaScript, just by using the `hidden` attribute with the value `until-found`.

<div class="video-container">
  <video autoplay loop muted controls>
    <source src="{{ site.url }}/videos/2024-04-13/search-in-menu-1.mp4" type="video/mp4" />
  </video>
</div>

We will run into a little problem here. The elements displayed using the `hidden` attribute value `until-found` will be visible all the time. This isn't like what we had earlier where the visibility state is toggled. Once the element is found, the hidden attribute will be removed and the element will be visible all the time. Watch the video below to see what happens when we search for items in two different menus.

<div class="video-container">
  <video autoplay loop muted controls>
    <source src="{{ site.url }}/videos/2024-04-13/search-in-menu-2.mp4" type="video/mp4" />
  </video>
</div>

Luckily, JavaScript can help us with this. The new feature for the `hidden` attribute comes with a JavaScript event called `beforematch`. This event is triggered when an element is found using the search-in-page feature. We can use this event to toggle the visibility of the other element. Let's see how we can do this.

```javascript
// Get all the items with submenu
const itemsWithSubmenu = document.querySelectorAll('nav > ul > li:has(ul)');

// A function we will use to hide all the submenus by setting their hidden attribute to until-found
function hideAllSubmenus() {
  itemsWithSubmenu.forEach(menuItem => {
    menuItem.querySelector(':scope > ul').setAttribute('hidden', 'until-found');
  });
}

// Loop over all the items with submenu
itemsWithSubmenu.forEach(menuItem => {
  // Add an event listener to the submenu to hide all the submenus when a new menu is found
  menuItem.querySelector(':scope > ul').addEventListener('beforematch', hideAllSubmenus);

  // Simulate the hover effect by hiding all the submenus when the mouse enters or leaves the menu item
  menuItem.addEventListener('mouseenter', hideAllSubmenus);
  menuItem.addEventListener('mouseleave', hideAllSubmenus);

  // Simulate the focus effect by hiding all the submenus when the menu item is focused
  menuItem.addEventListener('focusin', hideAllSubmenus);
  menuItem.addEventListener('focusout', hideAllSubmenus);
});
```

Notice that we added event listeners for `mouseenter`, `mouseleave`, `focusin` and `focusout` to simulate the hover effect and focus effects. This is because the `beforematch` event is only triggered when the element is found using the search-in-page feature. These events will help us hide the other submenus when the user moves their cursor over or focuses on other the menu items.

<iframe title="Dropdown menu" scrolling="no" loading="lazy" style="height:400px; width: 100%; border:1px solid black; border-radius:5px;" src="https://v26.livecodes.io/?x=id/9x4cd39rmnw&embed=true&activeEditor=script">
  See the project <a href="https://v26.livecodes.io/?x=id/9x4cd39rmnw&activeEditor=script" target="_blank">Dropdown menu</a> on <a href="https://livecodes.io" target="_blank">LiveCodes</a>.
</iframe>

Here is a video demonstrating the full implementation:

<div class="video-container">
  <video autoplay loop muted controls>
    <source src="{{ site.url }}/videos/2024-04-13/search-in-menu-3.mp4" type="video/mp4" />
  </video>
</div>

We now have a dropdown menu that can work with a little help of JavaScript and is search-in-page friendly. This is a great improvement for usability.

## Closing thoughts

In future iterations of this demo, we can use feature detection to make this demo work gracefully for older browsers. Additionally, evaluating the accessibility of this solution against established standards like WCAG and ARIA will be a crucial step to ensure inclusivity for all users.

The `hidden` attribute with the value `until-found` is a great addition to the web platform and I think we will be relying on it more and more in the future. If I may ask for more things, it would be great to have a way to toggle the visibility of the element if a new match is found and a way to find the parent element of the text element. I wanted to move focus directly to the match anchor tag but the `beforematch` event doesn't have this kind of information. This way, we can build more user-friendly interfaces for our users.

**Special thanks goes to [Hate Hosny](https://twitter.com/hatem_hosny_) and [Konnor Rogers](https://twitter.com/RogersKonnor)** for their valuable feedback on this post. If you have any questions or suggestions, feel free to reach out to me on [Twitter](https://twitter.com/ahmadalfy). Thanks for reading!

## Additional resources

- The hidden attribute in HTML: [HTMHell 2023 Advent Calendar](https://www.htmhell.dev/adventcalendar/2023/11/)
- Content visibility: [web.dev](https://web.dev/articles/content-visibility#hiding_content_with_content-visibility_hidden)
- HTML attribute: hidden: until-found value: [caniuse.com](https://caniuse.com/mdn-html_global_attributes_hidden_until-found_value)
