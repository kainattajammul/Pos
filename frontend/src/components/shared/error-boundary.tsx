"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center backdrop-blur-sm">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {this.props.fallbackTitle ?? "Something went wrong"}
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              An unexpected error occurred. Try refreshing the page.
            </p>
          </div>
          <Button onClick={() => this.setState({ hasError: false })} variant="outline">
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
