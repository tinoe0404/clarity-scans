import { NextResponse } from 'next/server';
import { track } from '@vercel/analytics';
import { AppErrorType, classifyError } from './errorTypes';
import { logger } from './logger';
import { Locale } from '@/types';

import enMessages from '@/messages/en.json';
import snMessages from '@/messages/sn.json';
import ndMessages from '@/messages/nd.json';

const MESSAGES = {
  en: enMessages,
  sn: snMessages,
  nd: ndMessages,
};

export function handleClientError(error: unknown, context: string): void {
  const classified = classifyError(error);
  
  logger.error(`[Client Error: ${context}]`, {
    type: classified.type,
    message: classified.message,
    originalError: classified.originalError,
  });

  try {
    track('error_occurred', { 
      type: classified.type, 
      context 
    });
  } catch (trackErr) {
    logger.warn('Failed to track error analytics', trackErr as any);
  }
}

export function handleServerError(error: unknown, context: string): NextResponse {
  const classified = classifyError(error);
  
  // Safe logging that doesn't expose sensitive DB queries to the client
  logger.error(`[Server Error: ${context}]`, {
    type: classified.type,
    message: classified.message,
    originalError: classified.originalError instanceof Error ? classified.originalError.stack : classified.originalError,
  });

  let statusCode = 500;
  if (classified.type === 'NotFoundError') statusCode = 404;
  else if (classified.type === 'AuthError') statusCode = 401;
  else if (classified.type === 'ValidationError') statusCode = 400;
  else if (classified.type === 'ServerError' && 'statusCode' in classified) {
    statusCode = classified.statusCode || 500;
  }

  // Never expose stack traces or DB details in the response
  return NextResponse.json(
    {
      error: {
        type: classified.type,
        message: classified.message,
      }
    },
    { status: statusCode }
  );
}

export function getPatientErrorMessage(errorType: AppErrorType, locale: Locale): string {
  const localeMessages = MESSAGES[locale] || MESSAGES.en;
  
  switch (errorType.type) {
    case 'NetworkError':
      return localeMessages.errors.offline;
    case 'NotFoundError':
      return localeMessages.errors.notFound;
    case 'BlobError':
      return localeMessages.errors.noVideo;
    case 'ServerError':
    case 'DatabaseError':
    case 'UnknownError':
    default:
      return localeMessages.errors.serverError;
  }
}
