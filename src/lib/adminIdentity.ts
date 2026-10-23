// Server-only configuration. Knowing a UID never grants a session: Firebase must verify the ID token first.
export function isPrimaryAdmin(uid: string) {
  const configuredUid = process.env.FIREBASE_PRIMARY_ADMIN_UID?.trim();
  return Boolean(configuredUid && uid === configuredUid);
}
