import path from 'path'

const IGNORED_ARGS = new Set(['.', '--'])
const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown'])

export function getFilePathFromArgv(argv: string[] = process.argv): string | null {
  for (const arg of argv.slice(1)) {
    if (arg.startsWith('-') || IGNORED_ARGS.has(arg)) {
      continue
    }

    const extension = path.extname(arg).toLowerCase()

    if (MARKDOWN_EXTENSIONS.has(extension)) {
      return path.resolve(arg)
    }
  }

  return null
}

export function getStartupFilePath(
  argv: string[] = process.argv,
  pendingOpenFilePath: string | null = null
): string | null {
  return pendingOpenFilePath ?? getFilePathFromArgv(argv)
}
