---
title: Using HTML attributes on input tag to improve user experience
description: HTML5 introduced a whole bunch of attributes that can be used on form elements like `input` and `textarea` to eliminate the need of using JavaScript for validation. It also introduced other attributes like autocomplete
layout: post
codepen: false
codehighlighter: true
image: 05/og.jpg
---


HTML5 introduced a whole bunch of attributes that can be used on form elements like `input` and `textarea` to eliminate the need of using JavaScript for validation. It also introduced other attributes like [`autocomplete`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) which is used to guide the browser about the type of data it should use to fill in form elements if these data were previously entered and available.

One of the interesting values you can use is `autocomplete="tel"` which as you guess, prompts the user to put in the previously saved phone number. Now phone number comes in different formats based on how it's written where you live. Also, does it include a country code or not? The application you're working on might also have specific requirements for the format. So how does the browser pick the correct format?

I am working on an application targeting people living in a specific country. The application expects the phone number to be just 11 number without country code or any plus signs at the beginning. It bothered me when I was demonstrating my work that I always had to manually remove the country code and the plus sign whenever the browser attempts to complete the form for me:

<div class="video-container">
  <video autoplay loop muted controls poster="{{ site.url }}/images/05/before.jpg">
    <source src="{{ site.url }}/images/05/before.webm" type="video/webm" />
    <source src="{{ site.url }}/images/05/before.mp4" type="video/mp4" />
  </video>
</div>

As you can see, the validator immediately reports that it's invalid. It doesn't match the validation criteria we mentioned.

The HTML of the input is as follow. For simplicity, I removed all framework related attributes and kept the code to the minimum:

{:.line-numbers}

```html
  <input
    type="tel"
    required
    name="business-phone"
    id="register-business-phone"
    autocomplete="tel"
    placeholder="Business Phone Number"
  />
```

This issue can be easily resolved by using `minlength` and `maxlength` attributes, we can guide the browser to pick the suitable format that meets our validation criteria:

{:.line-numbers data-line="8,9"}

```html
  <input
    type="tel"
    required
    name="business-phone"
    id="register-business-phone"
    placeholder="Business Phone Number"
    autocomplete="tel"
    minlength="5"
    maxlength="11"
  />
```

Now let's try again and see the result:

<div class="video-container">
  <video autoplay loop muted controls poster="{{ site.url }}/images/05/after.jpg">
    <source src="{{ site.url }}/images/05/after.webm" type="video/webm" />
    <source src="{{ site.url }}/images/05/after.mp4" type="video/mp4" />
  </video>
</div>

Although the list clearly demonstrates the phone number with the country code, the browser removed that part upon selection and the value is just like what we wanted. This improves the way the user is interacting with our application. It's all done natively without any external dependencies. This works no matter what framework you are using.
