import path from 'path'

export function getDirectoryPath(filePath: string): string {
  return path.dirname(filePath)
}

export function isPathInsideDirectory(directoryPath: string, targetPath: string): boolean {
  const resolvedDirectory = path.resolve(directoryPath)
  const resolvedTarget = path.resolve(targetPath)
  const relativePath = path.relative(resolvedDirectory, resolvedTarget)

  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

export function resolveResourcePath(baseDirectory: string, relativePath: string): string | null {
  if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return null
  }

  if (relativePath.startsWith('data:') || relativePath.startsWith('md-resource:')) {
    return null
  }

  const decodedPath = decodeURIComponent(relativePath.replace(/^file:\/\//i, ''))
  const resolvedPath = path.isAbsolute(decodedPath)
    ? path.resolve(decodedPath)
    : path.resolve(baseDirectory, decodedPath)

  if (!isPathInsideDirectory(baseDirectory, resolvedPath)) {
    return null
  }

  return resolvedPath
}
