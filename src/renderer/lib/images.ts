function getDirectoryPath(filePath: string): string {
  const index = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  return index === -1 ? '' : filePath.slice(0, index)
}

function buildResourceUrl(baseDirectory: string, resourcePath: string): string {
  const url = new URL('md-resource://image')
  url.searchParams.set('base', baseDirectory)
  url.searchParams.set('path', resourcePath)
  return url.toString()
}

function shouldRewriteImageSource(source: string): boolean {
  const value = source.trim().toLowerCase()

  return !(
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('md-resource:') ||
    value.startsWith('blob:')
  )
}

export function rewriteImageSources(html: string, markdownFilePath: string): string {
  const baseDirectory = getDirectoryPath(markdownFilePath)
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('img').forEach((image) => {
    const source = image.getAttribute('src')

    if (!source || !shouldRewriteImageSource(source)) {
      return
    }

    image.setAttribute('src', buildResourceUrl(baseDirectory, source))
  })

  return template.innerHTML
}
