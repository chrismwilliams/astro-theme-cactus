---
title: "Adding Webmentions to Astro Cactus"
description: "This post describes the process of adding webmentions to your own site"
publishDate: "11 Oct 2023"
tags: ["webmentions", "astro", "social"]
---

## tldr

1. Ensure your social media links are added in `src/components/SocialList.astro`, most importantly the email address
2. Create an account @ [Webmention.io](https://webmention.io/).
3. Add the link feed to `siteConfig.webmentions`, found in `src/site.config.ts`.
4. Create a `.env` file, or rename the included `.example.env`, and add the key `WEBMENTION_API_KEY` and set the api key as the value.
5. Go to [brid.gy](https://brid.gy/) and sign-in to each social account[s] you wish to link.
6. Publish and build your website, remember to add the api key, and it should now be ready to receive webmentions!
7. That's it, maybe give this post a like!

## What are webmentions

Put simply, it's a way to show users who like, comment, repost and more, on various pages on your website via social media.

This theme displays the number of likes, mentions and replies each blog post receives. There are a couple of more webmentions that I haven't included, like reposts, which are currently filtered out, but shouldn't be too difficult to include.

## Steps to add it to your own site

Your going to have to create a couple of accounts to get things up-and-running. But, the first thing you need to ensure is that your social links are correct.

- Head over to `src/components/SocialList.astro` and enter your details into the `socialLinks` array. By default, the most important is your email address as this has the `isWebmention` property. This just adds the `rel="me authn"` value to the social link. You don't have to include an email, you can just delete it and any others, just make sure that at least one social link has the `isWebmention` property, or set the `rel` property yourself. See [IndieLogin.com](https://indielogin.com/setup) for more information on how to authenticate your domain via links.

- Next up, head over to [Webmention.io](https://webmention.io/) and setup an account by Signing in with your domain name, e.g. `https://astro-cactus.chriswilliams.dev/`. Please note that .app TLD's don't function correctly. Once in, it will give you a couple of links for your domain to accept webmentions. Make a note of these and head over to `src/site.config.ts` and add them to `siteConfig.webmentions`.

Quick note: You don't have to include the pingback link. Maybe coincidentally, but after adding it I started to receive a higher frequency of spam in my mailbox, informing me that my website could be better. Tbh they're not wrong. I've now removed it, but it's up to you.

- Next is to add your api key, also from [Webmention.io](https://webmention.io/), to a `.env` file. Rename the `.example.env`, or create your own, with `WEBMENTION_API_KEY=` and then your personal key. Please try not to publish this to a repository.

- You're now going to have to sign-up to [brid.gy](https://brid.gy/). As the name suggests, it links your website to your social media accounts (you need to add your website to these social accounts if you don't already), so sign-up/connect each account you intend brid.gy to search. Just a thing to note again, brid.gy currently has an issue with .app TLD domains.

With everything set, it's now time to build and publish your website. _REMEMBER_ to set the `WEBMENTION_API_KEY` key with your host, I also forgot this part.

## Testing everything works

With everything setup and live, you can check to see if everything is working by sending a test webmention via [webmentions.rocks](https://webmention.rocks/receive/1). Log in with your domain, enter the auth code, and then the url of the page you want to test. For example, to test this page I would add `https://astro-cactus.chriswilliams.dev/posts/webmentions/`. To view it on your website, rebuild or [re]start dev mode locally, and you should see the result at the bottom of your page.

You can also view any test mentions in the browser via the [api](https://github.com/aaronpk/webmention.io#api).

## Things to add, things to consider

- At the moment, fresh webmentions are only fetched on a rebuild or restarting dev mode, which obviously means if you don't update your site very often you wont get a lot of new content. It should be quite trivial to add a cron job to run the `getAndCacheWebmentions()` function in `src/utils/webmentions.ts` and populate your blog with new content. This is probably what I'll add next as a github action.

- I have seen some mentions have duplicates. Unfortunately, they're quite difficult to filter out as they have different id's.

- I'm not a huge fan of the little external link icon for linking to comments/replies. It's not particularly great on mobile due to its size, and will likely change it in the future.

## Acknowledgements

Many thanks to [Kieran McGuire](https://github.com/chrismwilliams/astro-theme-cactus/issues/107#issue-1863931105) for sharing this with me, and the helpful posts. I'd never heard of webmentions before, and now with this update hopefully others will be able to make use of them. Additionally, articles and examples from [kld](https://kld.dev/adding-webmentions/) and [ryanmulligan.dev](https://ryanmulligan.dev/blog/) really helped in getting this set up and integrated, both a great resource if you're looking for more information!
