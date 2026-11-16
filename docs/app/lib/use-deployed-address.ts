import { useEffect } from 'react'
import { siteOrigin } from './shared'

/**
 * The pre-rendered pages name the site by its build-time origin (`SITE_ORIGIN`). When the reader opened the docs at
 * another address — a second domain, a preview URL, or a build without `SITE_ORIGIN` — this puts that address into
 * the text and links of the page instead, including content that appears later, such as tabs and search results.
 * It runs after hydration, so React finds the markup it rendered.
 */
export function useDeployedAddress() {
  useEffect(() => {
    const built = new URL(siteOrigin).host
    const { host, origin } = window.location
    if (built === host) return
    // The host as a whole name: not the tail of a longer one (`a.<built>`) and not the head of one (`<built>.example`).
    const pattern = new RegExp(`(?<![\\w.-])(https?://)?${built.replaceAll('.', '\\.')}(?![\\w-]|\\.\\w)`, 'g')
    const rewrite = (value: string) => value.replace(pattern, (_, scheme?: string) => scheme ? origin : host)
    const patchText = (node: Node) => {
      const value = node.nodeValue
      if (!value?.includes(built)) return
      const next = rewrite(value)
      if (next !== value) node.nodeValue = next
    }
    const patchLink = (link: Element) => {
      const href = link.getAttribute('href')
      if (!href?.includes(built)) return
      const next = rewrite(href)
      if (next !== href) link.setAttribute('href', next)
    }
    const patch = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) return patchText(node)
      if (!(node instanceof Element)) return
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) patchText(walker.currentNode)
      if (node.matches('a[href]')) patchLink(node)
      node.querySelectorAll('a[href]').forEach(patchLink)
    }
    patch(document.body)
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'attributes') patchLink(record.target as Element)
        else if (record.type === 'characterData') patchText(record.target)
        else record.addedNodes.forEach(patch)
      }
    })
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['href'] })
    return () => observer.disconnect()
  }, [])
}
