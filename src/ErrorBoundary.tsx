import { Component, ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 text-sm font-mono whitespace-pre-wrap text-destructive">
          <div className="font-bold mb-2">Something went wrong.</div>
          <div>{this.state.error.message}</div>
          <div className="mt-2 text-muted-foreground text-xs">
            {this.state.error.stack}
          </div>
          <button
            type="button"
            className="mt-4 px-3 py-1 border rounded"
            onClick={() => this.setState({ error: null })}
          >
            Dismiss
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
