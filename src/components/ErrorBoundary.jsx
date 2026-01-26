import { Component } from 'react'
import { AlertOctagon, RefreshCw, Copy, CheckCircle } from 'lucide-react'

const isDev = import.meta.env.DEV

const DEV_ACTION_STYLE = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors'
const INFO_PANEL_STYLE = 'bg-[#16213e] rounded-xl p-4 mb-4 border border-gray-700'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })

    if (isDev) {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Component stack:', errorInfo?.componentStack)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  handleCopyError = async () => {
    const { error, errorInfo } = this.state
    const errorText = `Error: ${error?.message || 'Unknown error'}

Stack trace:
${error?.stack || 'No stack trace available'}

Component stack:
${errorInfo?.componentStack || 'No component stack available'}`

    try {
      await navigator.clipboard.writeText(errorText)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch (err) {
      console.error('Failed to copy error:', err)
    }
  }

  renderDevError() {
    const { error, errorInfo, copied } = this.state

    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white p-6 font-mono">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-400">Something went wrong</h1>
              <p className="text-sm text-gray-400">Development Error Display</p>
            </div>
          </div>

          <div className="bg-[#16213e] rounded-xl p-4 mb-4 border border-red-500/30">
            <h2 className="text-sm font-semibold text-red-400 mb-2">Error Message</h2>
            <p className="text-white">{error?.message || 'Unknown error'}</p>
          </div>

          {error?.stack && (
            <div className={INFO_PANEL_STYLE}>
              <h2 className="text-sm font-semibold text-yellow-400 mb-2">Stack Trace</h2>
              <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          )}

          {errorInfo?.componentStack && (
            <div className={INFO_PANEL_STYLE}>
              <h2 className="text-sm font-semibold text-blue-400 mb-2">Component Stack</h2>
              <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleCopyError}
              className={`${DEV_ACTION_STYLE} bg-gray-700 hover:bg-gray-600`}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Error
                </>
              )}
            </button>
            <button
              onClick={this.handleReset}
              className={`${DEV_ACTION_STYLE} bg-blue-600 hover:bg-blue-500`}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className={`${DEV_ACTION_STYLE} bg-red-600 hover:bg-red-500`}
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Tip: This detailed error view only appears in development mode.
            Production users will see a friendly error message.
          </p>
        </div>
      </div>
    )
  }

  renderProductionError() {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertOctagon className="w-10 h-10 text-red-500" />
          </div>
          <h1
            className="text-2xl font-bold text-[#3D3D3D] mb-3"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Oops! Something went wrong
          </h1>
          <p className="text-[#6B6B6B] mb-6">
            We're sorry, but something unexpected happened.
            Please try again or reload the page.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-[#F4A261] hover:bg-[#E8924F] text-white font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[#3D3D3D] font-semibold rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return isDev ? this.renderDevError() : this.renderProductionError()
  }
}

export default ErrorBoundary
