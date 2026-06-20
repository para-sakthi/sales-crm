import { useExamples } from '../hooks/useExamples'

export function ExampleList() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = useExamples()

  if (isLoading) return <p>Loading...</p>
  if (isError || !data) return <p>Something went wrong.</p>

  const items = data.pages.flatMap((page) => page.data)

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load more</button>
      )}
    </div>
  )
}
