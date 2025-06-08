import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export function useFrameworkReady() {
  useEffect(() => {
    logger.info('Framework', 'Framework ready hook initialized');
    
    // Log any unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Framework', 'Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      });
    };

    // Log any uncaught errors
    const handleError = (event: ErrorEvent) => {
      logger.error('Framework', 'Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      }
    };
  }, []);
}