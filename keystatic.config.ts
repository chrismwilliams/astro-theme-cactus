// keystatic.config.ts
import { config, fields, collection, singleton } from '@keystatic/core';
import type { Config } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'bhandzo',
      name: 'setpiece-site',
    },
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
    problemCards: collection({
      label: 'Problem Cards',
      slugField: 'title',
      path: 'src/content/problemCards/*',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        order: fields.number({ 
          label: 'Display Order',
          defaultValue: 0
        }),
        description: fields.markdoc({ 
          label: 'Description',
          extension: 'md'
        })
      }
    }),
    differentiators: collection({
      label: 'Differentiators',
      slugField: 'title',
      path: 'src/content/differentiators/*',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        order: fields.number({ 
          label: 'Display Order',
          defaultValue: 0
        }),
        description: fields.markdoc({ 
          label: 'Description',
          extension: 'md'
        })
      }
    }),
    services: collection({
      label: 'Services',
      slugField: 'title',
      path: 'src/content/services/*',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        order: fields.number({ 
          label: 'Display Order',
          defaultValue: 0
        }),
        description: fields.markdoc({ 
          label: 'Description',
          extension: 'md'
        })
      }
    })
  },
  singletons: {
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/homepage',
      schema: {
        // Hero section
        heroTitle: fields.text({ 
          label: 'Hero Title',
          defaultValue: 'When you hit a wall, we transform everything.'
        }),
        heroDescription: fields.text({ 
          label: 'Hero Description',
          multiline: true,
          defaultValue: 'We are AI-native operating partners for SaaS leaders who\'ve hit a wall. Get unstuck and go fast (again).'
        }),
        
        // What got you here section
        mainProblemTitle: fields.text({
          label: 'Main Problem Title',
          defaultValue: 'What got you here stopped working'
        }),
        mainProblemDescription: fields.text({
          label: 'Main Problem Description',
          multiline: true,
          defaultValue: 'Whether you\'re finding product-market fit, scaling past early success, or managing explosive growth - what used to work is now making things worse. Every day feels like trying to stay afloat instead of building the future.'
        }),
        
        // We're Built Different section
        differentiatorTitle: fields.text({
          label: 'Differentiator Title',
          defaultValue: 'We\'re Built Different'
        }),
        
        // Services section
        servicesTitle: fields.text({
          label: 'Services Title',
          defaultValue: 'Sprint to get unstuck'
        }),
        servicesSubtitle: fields.text({
          label: 'Services Subtitle',
          defaultValue: 'How we work with you to get your groove back'
        }),
        servicesDescription: fields.text({
          label: 'Services Description',
          multiline: true,
          defaultValue: 'Strategy clarity first, then systematic transformation. No wasted effort optimizing the wrong things.'
        })
      }
    })
  }
});