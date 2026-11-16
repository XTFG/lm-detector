import type { Root } from 'mdast'
import type {} from 'mdast-util-mdx-jsx'
import { visit } from 'unist-util-visit'
import { withSiteAddress } from '../../site.config.ts'

/**
 * Applies `withSiteAddress` to text, code, link targets and string props such as `href`, at compile time. The
 * content files keep the address they were written with.
 */
export function remarkSiteAddress() {
  return (tree: Root) => {
    visit(tree, node => {
      if ((node.type === 'text' || node.type === 'inlineCode' || node.type === 'code' || node.type === 'html') && node.value) node.value = withSiteAddress(node.value)
      if (node.type === 'link' || node.type === 'image' || node.type === 'definition') node.url = withSiteAddress(node.url)
      if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return
      for (const attribute of node.attributes) {
        if (attribute.type === 'mdxJsxAttribute' && typeof attribute.value === 'string') attribute.value = withSiteAddress(attribute.value)
      }
    })
  }
}
