import { createOpenAPI } from 'fumadocs-openapi/server'
import type { Document } from 'fumadocs-openapi'
import { siteOrigin, siteUrl, withSiteAddress } from '../../site.config.ts'
import spec from '../../../worker/openapi.json'

/**
 * The proxy's contract lives next to its implementation, so a change to `worker/main.js` has its schema at hand.
 * The pages show it with this deployment's address, and the site proxy's server URL is a path, which the playground
 * resolves against the address the reader opened.
 */
function document() {
  const document = JSON.parse(withSiteAddress(JSON.stringify(spec))) as Document
  for (const server of document.servers ?? []) {
    if (server.url === siteUrl) server.url = siteUrl.slice(siteOrigin.length) || '/'
  }
  return document
}

export const openapi = createOpenAPI({ input: { '../worker/openapi.json': document } })
