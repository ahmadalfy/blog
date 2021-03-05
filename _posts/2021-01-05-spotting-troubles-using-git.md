---
layout: post
title:  "Early detection of potential problems by checking frequently updated files using Git"
codepen: false
codehighlighter: true
date:   2021-01-05 00:00:00
---

One of the popular metrics used to assess the engineering team's output is Code Churn. It has several definitions and each company and tool measures it differently. I like how [Pluralsight defines it](https://www.pluralsight.com/blog/tutorials/code-churn):

> Code Churn is when a developer re-writes their own code shortly after it has been checked in (typically within three weeks).

Measuring Code Churn is difficult and requires tools that can analyze Git history. It tracks the change of lines of code overtime per contributor and the output is more than just the additions vs deletions. I am not going to talk about Code Churn too much because the article by Pluralsight does that very well. I want to share a similar concept we're starting to experiment with.

During my journey to find how Code Churn is measured, I found a way to find how many commits were made to files. Let's take a look at the snippet below:

```bash

git log --name-only --format='' | \
  sort | \
  uniq -c | \
  sort -r -k1 -n | \
  head -n 10

```

When this command is executed inside a Git repository, it will list the top 10 files that have been committed to. The list will show the number of commits then the path of the file. Let's take an example by running that command on the repository of [next.js](https://github.com/vercel/next.js/), we will get the following stats:

```bash

1136 packages/next/package.json
 893 package.json
 789 lerna.json
 690 packages/next-bundle-analyzer/package.json
 685 packages/next-mdx/package.json
 559 packages/create-next-app/package.json
 556 yarn.lock
 476 packages/next-plugin-google-analytics/package.json
 474 packages/next-plugin-sentry/package.json
 379 packages/next-polyfill-nomodule/package.json

```

That's pretty much expected, the top 10 files are package configuration files. It might be because the maintainers are keeping the dependencies up to date all the time. If we are interested more in the code the developers write, we can modify the script to exclude these files using `grep` and regular expressions:

```bash

git log --name-only --format='' | \
  grep -Pv '([package,lerna].json|.lock|.md|/build/)' | \
  sort | \
  uniq -c | \
  sort -r -k1 -n | \
  head -n 10

```

**Update (5th or March)**: as pointed out by my friend [Ahmed El Gabri](https://twitter.com/ahmedelgabri); it's better if we exclude the merge commits as well by using `--no-merges` flag:

```bash

git log --name-only --no-merges --format='' | \
  grep -Pv '([package,lerna].json|.lock|.md|/build/)' | \
  sort | \
  uniq -c | \
  sort -r -k1 -n | \
  head -n 10

```

We've excluded packages' configurations, `lock` files, markdown files, and anything within the path `build`. We will finally start to see the output we're interested in:

```bash

192 packages/next/next-server/server/next-server.ts
145 server/index.js
139 packages/next/next-server/lib/router/router.ts
129 server/render.js
125 test/integration/production/test/index.test.js
125 packages/next/next-server/server/render.tsx
114 packages/next/taskfile.js
114 packages/next/next-server/server/config.ts
105 packages/next/client/index.js
101 packages/next/pages/_document.tsx

```

We can now see that most of the work is happening in `next-server`. It's receiving most of the commits from the contributors and it's expected. After all, that's the core of that package.

## How can this information be valuable?

In agile teams that work by sprints, by the end of each sprint, the team can get this data for analysis and discussion. A high number of commits to certain paths can happen due to many reasons like:

* There are unresolved bugs that require intervention in the same file over and over. Maybe it's because of poor quality, unhandled cases, or not enough tests.
* It might be an indicator that this file should be refactored into smaller modules.
* Changes are happening because of the continuously changing requirements.
* The file is a build artifact that should be taken outside of version control to be handled by CI/CD.
* Unnecessary updates caused by misconfigured linting tool in a contributor's development environment.

Having an open discussion during sprint reviews could be the key to early detection of anything that can be fixed. The earlier command lists the frequency of commits in a specific branch since the beginning of the repository. For sprint review, it might be useful also to check that frequency during the sprint. Thankfully, Git allows us to log the changes after a specific date by using the `since` flag.

I ran this script on a couple of active projects we have and shared the numbers with the teams. On some projects, we were able to spot some problems quickly and took corrective actions. Others were showing inconclusive data where  the number of commits was aligned with the output of the sprints. I am pretty confident that this procedure will help us improve the quality of our work and I expect I will write more about the results after we adopt it.

If you're interested in knowing how the script work, I've included a section below to explain it.

<details markdown="1">
<summary>Command dissection</summary>

Each line of the script produce an output. That output is manipulated by the next line. You can think of it like an assembly line where each workstation receives an input and update it.

```bash

git log --since=2020-12-01 --name-only --no-merges --format=''

```

`git log` shows the commits log. The flags we provide modify the output and its format

* `since` will show only the log of commits after certain date.
* `name-only` will show only the names of the changed files.
* `no-merges` will exclude merge commits.
* `format` defines the formatting of the output. In our case nothing is shown.

```bash

grep -Pv '([package,lerna].json|.lock|.md|/build/)'

```

`grep` is a utility used to search in text. We use the flag `-Pv` that will instruct `grep` to return all the strings that doesn't match the supplied RegExp (defined by the `v` flag). Note that we're using a Perl-compatible RegExp(PCRE) (defined by the `P` flag). Note that PCRE doesn't work by default on Mac, you will have to install [GNU grep](https://formulae.brew.sh/formula/grep) using brew and use `ggrep` instead.

```bash

sort

```

`sort` will sort the output, brining similar lines together to prepare the next utility to count their frequency.

```bash

uniq -c

```

`uniqu` will filter out all the repeated lines. The count flag `-c` will display the number of how many times a path has been repeated.

```bash

sort -r -k1 -n

```

Again here we sort the output but this time by the number written at the beginning of each line (defined by `-k1`) and we supply the type of ordering as numeric (`-n`) and finally we reverse the order to display the higher numbers on top (defined by `-r`).

```bash

head -n 10

```

Finally, the `head` command is used to display only the top 10 lines (`-n` define that we're interested in number of lines).

</details>

### Resources

* [Introduction to Code Churn](https://www.pluralsight.com/blog/tutorials/code-churn) - An article by Pluralsight.
* [True Git Code Churn](https://github.com/flacle/truegitcodechurn/) - A python script that can be used to measure Code Churn.

Special thanks to [Emad Elsaid](https://twitter.com/emad__elsaid) for taking time to review this article.
