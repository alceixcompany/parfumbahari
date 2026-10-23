export const ADMIN_SESSION_COOKIE = 'parfum_bahari_admin_session';
export const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const sign = async (value: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
};

export const createAdminSessionToken = async (email: string, secret: string) => {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_DURATION_SECONDS;
  const payload = `${email}.${expiresAt}`;
  return `${payload}.${await sign(payload, secret)}`;
};

export const verifyAdminSessionToken = async (token: string | undefined, secret: string) => {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length < 3) return false;

  const signature = parts.pop();
  const expiresAt = Number(parts.pop());
  const email = parts.join('.');
  if (!email || !signature || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${email}.${expiresAt}`;
  const expectedSignature = await sign(payload, secret);
  if (signature.length !== expectedSignature.length) return false;

  let difference = 0;
  for (let index = 0; index < signature.length; index += 1) {
    difference |= signature.charCodeAt(index) ^ expectedSignature.charCodeAt(index);
  }
  return difference === 0;
};
