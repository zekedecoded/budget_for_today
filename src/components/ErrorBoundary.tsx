import { Component, type ErrorInfo, type ReactNode } from 'react'
import { PixelIcon } from './PixelIcon'

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
          <div className="pixel-panel max-w-lg text-center" style={{ padding: '24px' }}>
            <PixelIcon name="warning" size={24} className="text-danger mb-2" />
            <p className="font-pixel text-[16px] text-danger mb-2">Something went wrong</p>
            <pre className="font-pixel text-[13px] text-muted overflow-auto">{this.state.error.message}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
