import { http, HttpResponse } from 'msw'

// Add MSW request handlers here.
// Handlers defined here are active in tests by default.
// Per-test overrides: server.use(http.get('/endpoint', handler))
export const handlers = [
  http.get('http://localhost:3000/v1/example', () => {
    return HttpResponse.json({
      data: [{ id: '1', name: 'Example item' }],
      meta: { nextCursor: null, total: 1 },
    })
  }),
]
