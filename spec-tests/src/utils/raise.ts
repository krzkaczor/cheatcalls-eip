export function raise(e: Error | string): never {
  if (typeof e === 'string') {
    throw new Error(e)
  }

  throw e
}
