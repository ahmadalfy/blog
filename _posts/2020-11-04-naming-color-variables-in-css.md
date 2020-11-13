---
title: Naming color variables in CSS
description: Recently I was building a website for a company where I found a component that I've never built anything like before. The content of the website should lie within a fixed width container just like most of the websites out there
layout: post
codepen: false
codehighlighter: true
image: 04/og.jpg
---

Nearly 30 years ago, I had a severe head injury after falling down the floor of our bathroom. I remember exactly what happened, there was blood everywhere, my mom was panicking ... With the aid of our neighbors, they rushed to the hospital where I received a couple of stitches to my forehead. Their marks are still visible until this day.

I still remember this day, not because of that painful memory, but it's also because this is the night where my father brought us our first personal computer. It was an [MSX Sakhr AX150](https://en.wikipedia.org/wiki/Sakhr_Computers). In his attempt to calm me down and make it up for me for the lockdown I was forced to, my father, unknowingly, introduced me to that thing that changed my life.

At this time, that computer had a very limited set of applications. One of them was an implementation of BASIC extended by Microsoft called [MSX-BASIC](https://en.wikipedia.org/wiki/MSX_BASIC). The computer came with a manual explaining how to use BASIC to print funny things on the screen, how to receive user input and utilize it and more interesting stuff to keep a 9-year-old child hooked into this magical world.

In BASIC, the program statements had numbers prefixed to each line, usually starting with 10 and its multiples. The reason behind using these numbers was to control the flow of the application. BASIC had a GOTO statement that allowed programmers to control the flow of their programs.

{:.image-container}
![Screenshot of a program written in BASIC]({{ site.url }}/images/06/basic.png)

Later on, I learned from my school teacher that using multiples of 10 is the preferred way to write programs because it will help programmers refactor their code in the future. If you want to add a statement between 30 and 40, call it 35! Of course, at this time I had no idea what the word refactoring means. My teacher simply told me if I forget a line I can use that trick.

This is a very weird introduction to talk about naming color variables in CSS I know, but when I saw Tailwind using that methodology, it immediately came to my mind and reminded me of what I used to do when I was playing with BASIC 30 years ago.

Before [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) were introduced to CSS, several preprocessors like SASS and LESS introduced CSS variables. We've been using these variables as placeholders for colors. The way we used to name these colors were different

```scss
// Naming according to the role in the design
$mainBrandColor
$secondaryFocus
$fadedHighlight


// Or sometimes something similar
$color-primary
$color-primary-dark
$color-primary-light


// Naming according to color itself
$orange
$red
$blue
```

Unfortunately, both ways do not scale very well. As you introduce more variables, it becomes harder and harder to name these variables and to remember them. We end up looking for the hexadecimal value of the color and copy the name we gave to the variables. Also, if you already have a variable called $red and you want to add two more variables that are also different red. You end up with something like:

```scss
$red
$light-red
$lighter-red
```

As you can see, this won't scale at all. A couple of months ago, a friend of mine was showing me [Tailwind CSS](https://tailwindcss.com/); a utility-first CSS framework. Tailwind CSS follows a methodology inspired by [Material Design](https://material.io/design/color/the-color-system.html#color-theme-creation) for [naming their colors](https://tailwindcss.com/docs/customizing-colors#default-color-palette).

```scss
$gray-100: #F7FAFC;
$gray-200: #EDF2F7;
$gray-300: #E2E8F0;
$gray-400: #CBD5E0;
$gray-500: #A0AEC0;
$gray-600: #718096;
$gray-700: #4A5568;
$gray-800: #2D3748;
$gray-900: #1A202C;
```

{:.image-container}
![Color palette of  Tailwind CSS grey shade showing how they name their variables]({{ site.url }}/images/06/colors.png)

When I saw that, I immediately remembered the numbers we used in BASIC. I can now simply name my color variables in a way that will scale. The lower the number means the lighter the color will be. I can also pick a name between two variables. Between 300 and 400? How about 350? I've been using this way for a couple of months now and it has been easier:

```css
scope {
  --green-900: #2b6372;

  --grey-300: #989aa0;
  --grey-500: #aeacac;
  --grey-900: #31364c;

  --cream-200: #eee4e0;
  --cream-300: #f5f2ed;
  --cream-600: #e8dac5;
  --cream-700: #d6b6aa;
  --cream-800: #cfbea4;
  --cream-900: #c0914b;

  --brown-900: #5d372e;
}
```

I add the colors with the weight that I feel and distribute other colors accordingly. You can start using that today if you're using SASS or custom properties. That doesn't solve the problem of remembering the name that we should use but at least we solved the naming complexity.

To close this I am going to use the cliché that says: **sometimes looking at the past helps to build the future**.

**Note**, this article was originally [published on LinkedIn](https://www.linkedin.com/pulse/css-color-variables-naming-ahmad-alfy)
