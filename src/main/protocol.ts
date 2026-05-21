import { constants } from 'fs'
import { access } from 'fs/promises'
import { net, protocol } from 'electron'
import { pathToFileURL } from 'url'
import { resolveResourcePath } from './resource-path'

export function registerPrivilegedSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'md-resource',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
}

export function registerMarkdownResourceProtocol(): void {
  protocol.handle('md-resource', async (request) => {
    const url = new URL(request.url)
    const baseDirectory = url.searchParams.get('base')
    const resourcePath = url.searchParams.get('path')

    if (!baseDirectory || !resourcePath) {
      return new Response('Bad Request', { status: 400 })
    }

    const resolvedPath = resolveResourcePath(baseDirectory, resourcePath)

    if (!resolvedPath) {
      return new Response('Forbidden', { status: 403 })
    }

    try {
      await access(resolvedPath, constants.R_OK)
      return net.fetch(pathToFileURL(resolvedPath).href)
    } catch {
      return new Response('Not Found', { status: 404 })
    }
  })
}
