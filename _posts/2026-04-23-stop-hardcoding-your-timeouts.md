---
layout: post
title:  'Stop Hardcoding Your Timeouts'
codepen: false
codehighlighter: false
mermaid: false
date: 2026-04-23 00:00:00
description: "Hardcoded timeouts with no config options are a silent tax on developers outside the wealthy west. A rant about npx skills, Docker Gordon, and the arrogance of assuming everyone has a fast connection."
---

*A developer rant about tools built for one kind of internet*

Recently, I've been losing my mind to **hardcoded timeouts**. Silent, arbitrary, unconfigurable time limits baked into tools by developers who apparently have never had to wait more than 200ms for anything in their lives.

Let me tell you about my week.

## The `skills` Package and the 60-Second Clone

Now that coding agents are everywhere, everyone is using skills. The popular way to add them is through packages developed by vercel-labs, and the go-to collection is **awesome-copilot**, a curated set of skills sitting at 30K+ stars at the time of writing. Except I can't use it. The repository is too big, and the `npx skills` installer just chokes and dies.

There's an open issue about this since February [#278 on the vercel-labs/skills repo](https://github.com/vercel-labs/skills/issues/278) and no one has responded. I'd be happy to send a PR and fix it myself. I just need someone to acknowledge it exists.

Is there a configuration option? A `--timeout` flag? An environment variable? No, there is nothing.

The workaround I found? Clone the repo manually first, then install from the local copy. It works, mostly. Except now `skills-lock.json` points to a path on my machine. My colleagues cannot use it. I also have to update my copy everytime I want update my skills. One workaround creates a lot of other problems.

## Docker Gordon and the 2-Minute Death Timer

Then came Docker Gordon, the AI-powered debugging assistant baked into Docker. Useful concept. I was stepping through a container build issue, the kind that requires iteration: tweak, rebuild, inspect, repeat. I've never used Gordon but when the error manifested itself, it came with a suggestion to try Gordon and so I did.

Except Gordon has a hard limit: if your container doesn't finish building within **two minutes**, it gives up. The session dies. You start over.

A two-minute build might sound like plenty if you're in a fast environment with warm caches and pulled base images. But if you're pulling a fresh base image over a slower connection? Debugging a multi-stage build with several heavy layers? Forget it. Gordon has already moved on.

There is no way to configure this. No `GORDON_TIMEOUT=600` env var. No `--build-timeout` flag. Nothing. The tool just assumes that two minutes is forever, and if you need more, that's your problem.

## The Pattern That's Driving Me Crazy

Developers often working on fast machines, in offices or homes with gigabit connections, in cities with world-class infrastructure. They build tools with timeout defaults that reflect their own experience. And then they ship those tools to the whole world, with no knobs to turn.

The thing is, timeouts *need* to exist. Infinite waits are bad. Hanging processes are bad. I'm not arguing against timeouts. I'm arguing against **unconfigurable** timeouts. Against the implicit message that says: *if you can't do this in 60 seconds, your environment is wrong, not my assumption.*

A timeout should be:

- A **safe default** for the common case
- **Clearly documented** so users know it exists
- **Overridable** via a flag, an environment variable, a config file, *something*

This isn't hard. It's respect for your users.

## The World Isn't a Data Center in Virginia

I'm writing this from Cairo. My internet is decent, better than many places in the world. But it's not 1 Gbps symmetric fiber. It's not co-located next to an npm registry mirror. A `git clone` of a large repo takes time. Pulling a Docker image takes time. These are not failures. They are physics.

When your tool dies silently after 60 seconds without any way to change that limit, you haven't built a tool for the world. You've built a tool for your office.

And this matters more than most developers acknowledge. The global developer community isn't located in San Francisco or Amsterdam or London. It's in Lagos, in Karachi, in Cairo. It's people on 4G connections, on shared broadband, on connections that have real latency because the nearest CDN edge is 50ms away instead of 5.

When you assume a fast connection, you're not making a neutral technical decision. You're making a statement about whose experience matters.

## A Note to Tool Authors

I don't think anyone is doing this maliciously. I think it's a blind spot. Your internet is fast, so a 60-second timeout feels generous. Your machines are powerful, so a 2-minute build window seems like plenty.

But please: before you ship a timeout, ask yourself:

- **What if the user is on a slower connection?**
- **What if their repo is larger than mine?**
- **What if they're debugging something slow, and that's the whole point?**

And then add a config option. One environment variable. One flag. That's all it takes to go from "this tool doesn't work for me" to "this tool works for me."

As Bruce Lawson once said: *it's the World Wide Web, not the Wealthy Western Web.*

The web and the tools we build on top of it are for everyone. Let's start acting like it.
