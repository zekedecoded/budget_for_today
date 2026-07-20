import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary caught:', error, info) }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-full items-center justify-center p-8">
          <div className="game-card-solid max-w-lg text-center">
            <span className="pokeball mx-auto mb-4" aria-hidden="true" />
            <p className="text-sm font-bold text-red-400 mb-2">An error occurred</p>
            <pre className="text-xs text-white/60 overflow-auto">{this.state.error.message}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}