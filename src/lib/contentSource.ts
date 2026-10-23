// Static is deliberately the default, even when Firebase keys are present.
// Switching sources is an explicit release step after importing the collection.
export const CONTENT_SOURCE = process.env.NEXT_PUBLIC_CONTENT_SOURCE === 'firebase' ? 'firebase' : 'static';
export const FIREBASE_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
