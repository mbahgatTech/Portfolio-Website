import { Component } from 'react';
import { reportError } from '../utils/analytics';
import { typed } from './board/fonts';
import styles from './ErrorBoundary.module.css';

/**
 * Catches errors thrown while rendering a page, reports them to error tracking
 * (PostHog's autocapture only sees errors that reach window), and shows a
 * reload prompt instead of a blank page.
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    reportError(error, { component_stack: info?.componentStack });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main role="alert" className={`${styles.wall} ${typed.className}`}>
        <div className={styles.slip}>
          <h1 className={styles.title}>Something went wrong.</h1>
          <p>This page hit an unexpected error. Reloading usually fixes it.</p>
          <button type="button" className={styles.reload} onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      </main>
    );
  }
}
