Base Layout
---
const { title = "Astro Swiss", description = "Swiss-modern grid system in Astro + Tailwind", baseline = false } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body class={`${baseline ? 'baseline' : ''}`}>
    <link rel="stylesheet" href="/favicon.svg" />
    <link rel="preconnect" href="https://rsms.me" />
    <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
    <style is:global>@import "./src/styles/baseline.css";</style>
    <style is:global>@import "./src/styles/base.css";</style>
    <slot />
  </body>
</html>

Grid.astro
---
/** Simple API so pages read like a layout spec instead of utility soup */
const { class: cls = "" } = Astro.props;
---
<div class={`grid grid-cols-12 gap-6 ${cls}`}>
  <slot />
</div>

Header.astro
---
const { kicker = "2025 / Issue 01", title = "Typography-forward Swiss layout" } = Astro.props;
---
<header class="py-10 md:py-16 container">
  <div class="grid grid-cols-12 gap-6 items-baseline">
    <h1 class="col-span-12 md:col-span-8 text-5xl font-medium tracking-tight">
      {title}
    </h1>
    <p class="col-span-12 md:col-span-4 md:text-right text-sm uppercase tracking-wide text-accent">
      {kicker}
    </p>
  </div>
</header>

Index.astro
---
import Base from "../layouts/Base.astro";
import Grid from "../components/Grid.astro";
import Header from "../components/Header.astro";
---
<Base title="Astro Swiss" baseline={false}>
  <Header title="GRID / TYPE" kicker="2025 — Structure & Rhythm" />

  <main class="container">
    <!-- Hero statement -->
    <Grid class="mb-12">
      <section class="col-span-12 md:col-span-8">
        <h2 class="text-3xl md:text-4xl leading-snug mb-6">
          Design with a <span class="text-accent">system</span>, not vibes.
        </h2>
        <p class="prose">
          Set a 4px baseline. Constrain measure to ~72ch. Use asymmetric spans to create rhythm.
          Keep copy flush-left, ragged-right. Let whitespace do the work.
        </p>
      </section>

      <aside class="col-span-12 md:col-span-4 md:pl-4">
        <div class="border-t border-ink/10 pt-4 text-sm leading-normal">
          <div class="font-medium uppercase tracking-wide mb-2">Contents</div>
          <ul class="space-y-1">
            <li>Grid & rhythm</li>
            <li>Type & hierarchy</li>
            <li>Asymmetry & tension</li>
          </ul>
        </div>
      </aside>
    </Grid>

    <!-- Two-column editorial with asymmetric spans -->
    <Grid class="pt-12">
      <article class="col-span-12 md:col-span-7">
        <h3 class="text-xl mb-3">Grid & Rhythm</h3>
        <p class="prose">
          Work on a 4px baseline. Headlines use tighter leading (<code>leading-snug</code>),
          body uses 1.5 (<code>leading-normal</code>). Don’t improvise line-heights.
        </p>
      </article>
      <aside class="col-span-12 md:col-span-5 md:self-start">
        <div class="p-6 border border-ink/10">
          <p class="text-sm leading-normal">
            Use <code class="font-mono">gap-6</code> for gutters, and consistent vertical spacing.
          </p>
        </div>
      </aside>
    </Grid>

    <!-- Poster-like block for contrast -->
    <section class="pt-16">
      <div class="grid grid-cols-12 gap-6 items-end">
        <div class="col-span-12 md:col-span-9">
          <div class="text-6xl leading-tight md:leading-snug font-medium tracking-tight">
            SYSTEM <span class="text-accent">/</span> STRUCTURE <span class="text-accent">/</span> SPACE
          </div>
        </div>
        <div class="col-span-12 md:col-span-3 md:text-right text-sm uppercase tracking-wide">
          Swiss method, web-native execution
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-16">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 md:col-span-6 text-sm">© Your Studio</div>
        <div class="col-span-12 md:col-span-6 md:text-right text-sm">
          Typeset in Inter. Colors: ink / accent.
        </div>
      </div>
    </footer>
  </main>
</Base>