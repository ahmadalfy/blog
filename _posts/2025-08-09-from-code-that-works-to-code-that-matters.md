---
layout: post
title:  "From Code That Works to Code That Matters: A PDF Security Feature Story"
codepen: false
codehighlighter: false
date: 2025-08-09 00:00:00
description: "A simple PDF upload validation task turned into a lesson on why code complete != user complete. Discover how small iterations in UX, security, and reliability make the difference between code that works and code that lasts."
---

*Or: Why being a valuable engineer means thinking beyond the technical requirements*

It started with a vulnerability report. Our [Strapi](https://strapi.io/)-based platform had a classic security issue: the file uploader was allowing PDFs with embedded scripts; a pentester's dream and our security nightmare. The fix seemed straightforward enough: block non-compliant PDFs by validating them against the PDF/A standard, which prohibits scripting and embedded content.

I dove into the technical challenge. After some research, I found [veraPDF](https://verapdf.org/), a binary tool that could validate PDF/A compliance. Using Strapi's webhook system, I hooked into the file upload process, ran the scanner, and threw an error for non-compliant files.

**BINGO.**

I was ready to celebrate. Running a binary from Node.js was new territory for me, and the JavaScript ecosystem had no good alternatives for PDF validation. The core functionality worked. Mission accomplished, right?

Not quite.

## When "Working" Isn't Good Enough

As I prepared my merge request, I took another look at the implementation. When a PDF failed validation, the system returned a generic "500 Internal Server Error." That nagging feeling hit, the one every engineer knows but doesn't always listen to.

*This isn't good enough.*

A 500 error suggests the server broke, but this was actually a client input issue; a 4xx error. More importantly, users would have no idea why their upload failed. After digging into Strapi's error handling, I found the `ValidationError` function and crafted a proper error response with a descriptive message.

Better, but still not done.

## The Cascade of Edge Cases

Then I realized something else: when validation failed, the uploaded file was still sitting on the server. The error stopped the process, but left digital debris behind. A quick cleanup function solved that.

But wait, what if veraPDF isn't installed on the server? I shared my branch with a colleague for testing, and sure enough, both compliant and non-compliant PDFs were failing validation. The binary wasn't in his PATH.

Now I needed to distinguish between "PDF validation failed" (user error, 4xx) and "veraPDF unavailable" (server configuration issue, 5xx), with appropriate error messages for each scenario.

## The Real Engineering Lesson

Here's what struck me: **the original requirement was simple "disallow PDFs with scripts." My first implementation technically satisfied that requirement. But it would have been terrible in practice.**

The engineering solution worked, but it took multiple iterations to make it *right*:

1. **First iteration**: Core functionality ✓
2. **Second iteration**: Proper error codes and messages ✓
3. **Third iteration**: File cleanup ✓
4. **Fourth iteration**: Graceful handling of missing dependencies ✓

None of these additional considerations came from the product team or the security testers. They emerged from thinking like a user, considering edge cases, and caring about the overall experience.

## Why This Matters for Your Career

This experience reinforced something crucial: **companies don't just want engineers who can write code that works. They want engineers who think holistically about problems.**

The difference between a junior and senior engineer isn't just technical complexity. It's the ability to:

- **Think beyond the happy path**: What happens when things go wrong?
- **Consider the user experience**: Even for internal tools and error states
- **Anticipate deployment issues**: What assumptions am I making about the environment?
- **Write maintainable code**: The next person (including future you) will thank you

This mindset—combining technical skills with product thinking and user empathy—is what makes engineers truly valuable. It's what turns a feature request into a robust solution that actually solves the problem.

## Breaking Down the Problem

What made this manageable was breaking down the problem into small, testable parts:

1. Can I run veraPDF from Node.js?
2. Can I integrate with Strapi's file upload lifecycle?
3. Am I returning appropriate error codes and messages?
4. Am I cleaning up properly on failures?
5. Am I handling environment dependencies gracefully?

Each iteration built on the last, gradually transforming working code into production-ready code.

## The Bottom Line

Technical skills will get you hired, but **product thinking and user empathy will make you indispensable**. The ability to see beyond the immediate technical requirement—to think about edge cases, user experience, and maintainability—is what separates good engineers from great ones.

Next time you're tempted to ship that first working version, pause and ask: *"What would make this not just work, but work well?"*

Your users (and your future self) will thank you.

*What's a time when you went beyond the basic requirements to create a better user experience? I'd love to hear your stories in the comments.*
