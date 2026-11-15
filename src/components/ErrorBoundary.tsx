import { Component, ErrorInfo, ReactNode } from 'react';
import { ERROR_BOUNDARY_DATA } from '../data/siteData';
import { generateCorrelationId } from '../lib/rateLimiter';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Container } from './ui/Container';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  correlationId: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    correlationId: '',
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
      correlationId: generateCorrelationId(),
    };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Never expose raw error objects, file paths, or stack traces to client logs.
  }

  private handleReload = (): void => {
    this.setState({ hasError: false, correlationId: '' });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-midnight text-cloud flex items-center justify-center py-16">
          <Container>
            <Card className="mx-auto max-w-xl text-center">
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <span aria-hidden="true" className="h-0.5 w-6 bg-signal" />
                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-cloud">
                  {ERROR_BOUNDARY_DATA.eyebrow}
                </span>
                <span aria-hidden="true" className="h-0.5 w-6 bg-signal" />
              </div>

              <h1 className="text-fluid-h2 font-display font-extrabold uppercase text-cloud mb-4">
                {ERROR_BOUNDARY_DATA.headingBefore}
                <span className="text-signal">{ERROR_BOUNDARY_DATA.headingHighlight}</span>
                {ERROR_BOUNDARY_DATA.headingAfter}
              </h1>

              <p className="text-cloud-muted mb-4 leading-relaxed">
                {ERROR_BOUNDARY_DATA.description}
              </p>

              {this.state.correlationId && (
                <p className="text-xs font-mono text-cloud-muted mb-8">
                  Correlation ID: {this.state.correlationId}
                </p>
              )}

              <Button variant="primary" size="md" showArrow onClick={this.handleReload}>
                {ERROR_BOUNDARY_DATA.retryLabel}
              </Button>
            </Card>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}
