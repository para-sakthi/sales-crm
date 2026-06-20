import { useInfiniteQuery } from '@tanstack/react-query'
import { getExamples } from '../api/example.api'

export function useExamples() {
  return useInfiniteQuery({
    queryKey: ['examples'],
    queryFn: ({ pageParam }) => getExamples({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
  })
}
