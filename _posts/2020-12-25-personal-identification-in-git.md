---
title: Personal identification in Git
description: 
layout: post
codepen: false
codehighlighter: true
---

### TL;DR version

Git associates your commits with your personal information. Specifically your name and email address. You have to properly configure this information for your own good and for the organization you're representing. If you're interested in knowing more, continue reading.

---

We use version control systems every day. Whether it's work-related, a personal project, or through contributions to open source software, you will have to use it at some point. When we talk about version control, we mostly associate it automatically with Git because of its popularity. Today I want to talk about configuring your *personal identification* on Git and talk a little bit about what it tells about your image as an engineer and the organization you belong to.

I am trying to remember the first time I heard about Git configuration. This part is usually rushed when you start to learn about Git. The reason maybe is because your attention at this point is to learn how to start using Git rather than bothering yourself with the configuration. Most people also never change and even don't know the configuration they set when they started to use Git.

### A little intro about Git configruation

Configurations in Git can be written on three different *levels*; system, global and local configurations. Each one overrides the previous level.

* system configuration, **affecting every user and repository for an operating system**. Its place differs according to the operating system. For Unix based system it's stored in `/etc/gitconfig`.
* global configurations, affecting **every repository for the current logged in user**. These settings are usually stored in the user's home directory in a file called `.gitconfig`.
* local configurations, affecting **only the current repository** and it's defined in `.git/config`.

In order to see the current configurations applied to a repository, we use a `git config` that comes with Git

```bash

git config --list

```

This will show the configurations affecting your current repository. We can use the following commands to know the source of the settings being applied:

```bash

git config --list --show-origin
# Will show each setting with the path of the file imposing it

git config --list --show-origin --show-scope
# Will show additional column at the beginning saying (system, global or local)

```

### Configuring your identification

Perhaps this is the only configuration Git requires you to set right after you try to create commits after a fresh installation. Your name and email will be associated with every action you do with Git. To set these configurations, we use `git config` as follow:

```bash

git config --global user.name "Your Name"
git config --global user.email "Your Email"

```

Identity is usually set once using the `global` flag. It's always mentioned in tutorials and articles that *this is something you will have to do only once* and therein lies the problem. I've seen it many times with fresh developers who start using Git after getting their first job. When they use their own machines, they usually associate the commits with the identity they created when they started to learn how to use Git. A lot of people write what we can consider *poor identification information* like:

* first or last name only
* name using all lowercase
* a nickname or a handler used in gaming
* spaces replace with dots or dashes
* university or personal email addresses
* automatically configured emails (in some systems like MacOS, sometimes Git automatically configure git to use user account details like User@User-MacBook.local)

### Why does it matter?

If you're working in an organization with large engineering teams, setting up your identity most likely happens during your onboarding. It is kind of important because:

* It facilitates communication between you and your colleagues. Your company is mostly using a code hosting platform that could have features to facilitate that but Git still can provide this information.
* The source code is considered intellectual property that belongs to your organization. It has to be associated with your employer's information.
* Companies usually use tools to analyze source code for several reasons like performance assessments, and to generate analytics and reports.

You can tell a lot about how solid are the engineering processes within an organization by examining the history provided by Git. I am not exaggerating but I believe that commits with poor identification information reflect a bad image of both the organization and the contributor.

**Note** that Git doesn't verify the ownership of the email set during configuration. This is why it's essential to sign your commits using something like your GPG key to keep the integrity of your repository. This is a different topic. I recommend checking [A Git Horror Story: Repository Integrity With Signed Commits
](https://mikegerwitz.com/2012/05/a-git-horror-story-repository-integrity-with-signed-commits).

### What should I do if I am not sure about my configuration?

If you're not aware of your identity configuration, go check it. Make sure your work-related commits are associated with the right information. Commits are immutable so you cannot change your previous commits without rewriting the history. There are answers on stackoverflow about how to do that but it's a slippery slope. You don't need to change old commits.

### What if I want to manage multiple identities?

You could be using your machine to do different types of work. Your company's work should be using your company's email and for example, you're contributing to an open source project and you want to associate these commits with your personal email.

#### The manual approach

Let's say you use this machine mostly for work-related stuff. Set your work email as the configured email address in your global configuration. Whenever you want to do work in a repository that should be associated with your personal email, provide that email in the local configuration only. It's simple but requires that you remember to do that step every time you clone or start a new personal project. This way we have a global configuration and we override it whenever necessary with local configuration.

#### Using an alias to set your information

I found [this interesting approach](https://www.micah.soy/posts/setting-up-git-identities/) by [Micah Henning](https://twitter.com/micahhenning). This approach unsets the personal identification from the global configuration and configures git to require a config file. After that, he creates [an alias](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases) to manage identities that would set name, email, and GPG key per repository. Basically we will be doing something like this:

```bash

git config --global user.personal.name "Your Name"
git config --global user.personal.email "Your Personal Email"

git config --global user.work.name "Your Name"
git config --global user.work.email "Your Work Email"

# In order to set identity in a repository
git identity personal

```

Note that `git identity` isn't a valid Git command. It's an alias used to read and set the configuration we set earlier. Read the full article to see the full details. Whats I really like about this approach is:

* Git won't allow you to create commits without setting the identity. You won't accidentally forget about that.
* It can be used to configure other stuff like the signing key which saves time and effort.

#### Providing configuration files

[Another approach](https://gist.github.com/bgauduch/06a8c4ec2fec8fef6354afe94358c89e#setup-dynamic-git-user-email--name-depending-on-folder) is to compose your configuration file. Basically, it removes the user block from the global Git configurtion and conditionally loads files when a certain condition is met. Consider the following:

```git

# ~/.gitconfig

  [includeIf "gitdir:~/code/personal/"]
    path = .gitconfig-personal
  [includeIf "gitdir:~/code/professional/"]
    path = .gitconfig-professional

```

This will make Git load a different file based on the path of the repository. The file shall be something like

```git

  [user]
    email = Your Personal Email
    name = Your Name

```

The problem with this approach is that it assume that your work is stored in a certain path.

Thank you for reading all this. Please leave any thoughts you have in the comments. Special thanks to [Ahmed Saleh](https://twitter.com/aonemd) for taking time to review this article.
