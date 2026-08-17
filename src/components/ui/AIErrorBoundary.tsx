import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary specifically for AI-powered sections.
 * Shows a non-intrusive fallback instead of crashing the whole page
 * when an AI response fails to render.
 */
export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[AIErrorBoundary] Render error in AI section:', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="status"
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
          >
            <p className="text-sm text-white/50">
              AI insights are temporarily unavailable. Your journal entry has been saved.
            </p>
            <button
              className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
