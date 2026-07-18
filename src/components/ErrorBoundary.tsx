import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-full items-center justify-center p-8">
          <pre className="max-w-lg overflow-auto rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
