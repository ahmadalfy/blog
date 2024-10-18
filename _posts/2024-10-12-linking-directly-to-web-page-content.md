---
layout: post
title:  "Smarter than 'Ctrl+F': Linking Directly to Web Page Content"
codepen: false
codehighlighter: true
date: 2024-10-11 00:00:00
description: "Discover how text fragments revolutionize web navigation. Learn to link directly to specific text on any web page, surpassing traditional 'Ctrl+F' searches. Explore this powerful, user-friendly feature for precise content sharing and improved web experiences."
---

Historically, we were able to link to a certain part of the page only if that part had an id. All we needed to do is to link to the URL and add the *document fragment* (ID). If we wanted to link to a certain part of the page, we needed to put an anchor to that part to link to it. This was until we were blessed with the **Text fragments**!

### What are Text fragments?

Text fragments are a powerful feature of the modern web platform that allow for precise linking to specific text within a web page without the need to add an anchor! This feature is complemented by the `::target-text` CSS pseudo-element, which provides a way to style the highlighted text.

Text fragments work by appending a special syntax to the end of a URL; just like we used to append the ID after the hash symbol (`#`). The browser interprets this part of the URL, searches for the specified text on the page, and then scrolls to and highlights that text if it supports text fragments. If the user attempt to navigate the document by pressing tab, the focus will move on to the next focusable element after the text fragment.

### How can we use it?

Here's the basic syntax for a text fragment URL:

```url

https://example.com/page.html#:~:text=[prefix-,]textStart[,textEnd][,-suffix]

```

Following the hash symbol, we add this special syntax `:~:` also known as *fragment directive* then `text=` followed by:

1. `prefix-`: A text string preceded by a hyphen specifying what text should immediately precede the linked text. This helps the browser to link to the correct text in case of multiple matches. This part is not highlighted.
2. `textStart`: The beginning of the text you're highlighting.
3. `textEnd`: The ending of the text you're highlighting.
4. `-suffix`: A hyphen followed by a text string that behaves similarly to the prefix but comes after the text. Aslo helpful when multiple matches exist and doesn't get highlighted with the linked text.

For example, the following link:

```url

https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments#:~:text=without%20relying%20on%20the%20presence%20of%20IDs

```

This text fragment we are using is "without relying on the presence of IDs" but it's [encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent). If you follow [this link](https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments#:~:text=without%20relying%20on%20the%20presence%20of%20IDs), it should look like the following:

{:.image-container}
![Screenshot from Google Chrome showing how highlighted text fragment look in Google Chrome]({{ site.url }}/images/2024/02/screenshot-01.png)

We can also highlight a range of text by setting the `startText` and the `endText`. Consider the following example from the same URL:

```url

https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments#:~:text=using%20particular,don't%20control

```

The text fragment we are using is "using particular" followed by a comma then "don't control". If you follow [this link](https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments#:~:text=using%20particular,don't%20control), it should look like the following:

{:.image-container}
![Screenshot from Google Chrome showing highlighted text fragment with start text and end text]({{ site.url }}/images/2024/02/screenshot-02.png)

We can also highlight multiple text by using ampersands. Consider the following:

```url

https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments#:~:text=using%20particular&text=it%20allows

```

If you follow [this link](https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments#:~:text=using%20particular&text=it%20allows), it should look like the following:

{:.image-container}
![Screenshot from Google Chrome showing different highlighted text fragment]({{ site.url }}/images/2024/02/screenshot-03.png)

One of the interesting behaviours about text fragments, if you're linking to hidden content that's discoverable through *find-in-page* feature (e.g. children of element with `hidden` attribute set to `until-found` or content of a closed `details` element), the hidden content will become visible. Let's look at this behaviour by linking to [this article](https://www.scottohara.me/blog/2022/09/12/details-summary.html) from Scott O'Hara's blog. The blog contain ths details element that is closed by default.

{:.image-container}
![Screenshot from Scott O'Hara's blog showing a details section]({{ site.url }}/images/2024/02/screenshot-04.png)

If we [linked to the text fragment](https://www.scottohara.me/blog/2022/09/12/details-summary.html#:~:text=Oh%20hi%20there.%20Forget%20your%20summary,%20didja) inside the details element, it will open automatically:

```url

https://www.scottohara.me/blog/2022/09/12/details-summary.html#:~:text=Oh%20hi%20there.%20Forget%20your%20summary,%20didja

```

{:.image-container}
![Screenshot from Scott O'Hara's blog showing a details section and it opens because it matches the text fragment inside the details section]({{ site.url }}/images/2024/02/screenshot-05.png)

**Note** that this behaviour is **only available in Google Chrome** as it's the only browser to support discoverable content.

### Styling highlighted fragments

If the browser supports text fragments, we can change the style of the highlighted text by using the `::target-text` pseudo-element

```css
::target-text {
    background-color: yellow;
}
```

Note that we are only allowed to change the following properties:

* color
* background-color
* text-decoration and its associated properties (including text-underline-position and text-underline-offset)
* text-shadow
* stroke-color, fill-color, and stroke-width
* custom properties

At the time of this article, Safari still does not support that selector unless you are using the Technology Preview version. 

### Browser support and fallback behaviour

Text fragments are currently supported in all the browsers. If it's not supported in the browser, it will simply degrade gracefully and the page will load without highlighting or scrolling to the text.

The default style for the highlight is different based on the browser. The color of highlight is different across the different browsers. The highlighted area is bigger in Safari spanning the whole line-height. In Firefox and Chrome only the text is highlighted and the spaces between the lines are empty.

{:.image-container}
![Demonstration of the differences in text highlight between the different browsers]({{ site.url }}/images/2024/02/comparison.png)

We can detect if the feature is supported or not using `document.fragmentDirective`. It will return an empty FragmentDirective object, if supported or will return undefined if it's not.


### Closing thoughts

Text fragments represent a significant leap forward for the web platform. This innovative feature empowers users to create precise links to specific content within any web document, even those beyond their control, without relying on pre-existing anchors. The beauty of text fragments lies in their seamless integration and graceful degradation – they enhance the browsing experience where supported, without compromising functionality in older environments. As web professionals, we have every reason to embrace and implement this technology today. It's a risk-free improvement that promises to make web navigation more intuitive and content discovery more efficient for our users.

TODO: add thanks notes to the reviewers

## Additional resources

- Text Fragments: [MDN](https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments)
- Style Highlights: [CSSWG Draft](https://drafts.csswg.org/css-pseudo/#highlight-styling)
