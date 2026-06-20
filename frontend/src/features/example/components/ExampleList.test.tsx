import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ExampleList } from './ExampleList'

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('ExampleList', () => {
  it('renders items from the API', async () => {
    renderWithClient(<ExampleList />)

    expect(await screen.findByText('Example item')).toBeInTheDocument()
  })

  it('shows a loading state initially', () => {
    renderWithClient(<ExampleList />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
