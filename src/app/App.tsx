// Main App component sets up providers (QueryClient, Router, Theme)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Router and layouts go here */}
      <div>App shell</div>
    </QueryClientProvider>
  )
}
