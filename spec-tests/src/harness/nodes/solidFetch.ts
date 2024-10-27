import fetchRetry from 'fetch-retry'

export const solidFetch = fetchRetry(fetch, {
  retries: 5,
  async retryOn(_attempt, error, response) {
    const retry = error !== null || !!(response && response.status >= 500)
    if (retry) {
      const errorMsg = await response?.text()
      // biome-ignore lint/suspicious/noConsoleLog: debugging
      console.log('[solidFetch] Retrying error', { error, response, errorMsg })
    }

    return retry
  },
  retryDelay(attempt) {
    return 2 ** attempt * 150
  },
})

export type SolidFetch = typeof solidFetch
