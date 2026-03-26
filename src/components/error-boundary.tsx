"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError)
      return (
        this.props.fallback ?? (
          <div className="p-8 text-center">
            <p className="text-lg font-semibold text-destructive">
              Something went wrong
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 text-sm text-primary underline"
            >
              Try again
            </button>
          </div>
        )
      );
    return this.props.children;
  }
}
