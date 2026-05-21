import path from 'path'

const IGNORED_ARGS = new Set(['.', '--'])

export function getFilePathFromArgv(argv: string[] = process.argv): string | null {
  for (const arg of argv.slice(1)) {
    if (arg.startsWith('-') || IGNORED_ARGS.has(arg)) {
      continue
    }

    const extension = path.extname(arg).toLowerCase()

    if (extension === '.md' || extension === '.markdown') {
      return path.resolve(arg)
    }
  }

  return null
}
