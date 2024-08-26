// Original implementation from: https://github.com/saicaca/fuwari/blob/main/src/plugins/remark-directive-rehype.js

import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

/**
 * Parses the directive node in the tree.
 *
 * @param {any} tree - The tree to parse.
 * @param {object} options - The options object.
 */
export function parseDirectiveNode() {
  return (tree: any, { }) => {
    visit(tree, function (node) {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {})
        node.attributes = node.attributes || {}
        if (
          node.children.length > 0 &&
          node.children[0].data &&
          node.children[0].data.directiveLabel
        ) {
          // Add a flag to the node to indicate that it has a directive label
          node.attributes['has-directive-label'] = true
        }
        const hast = h(node.name, node.attributes)

        // @ts-expect-error
        data.hName = hast.tagName
        // @ts-expect-error
        data.hProperties = hast.properties
      }
    })
  }
}