const nativeFetch = global.fetch;
const proxy = process.env.PARFUM_MIGRATION_TEST_PROXY;
if (!proxy || !/^http:\/\/127\.0\.0\.1:\d+$/.test(proxy)) throw new Error('Loopback test proxy required.');
global.fetch = (input, options) => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  if (url.hostname !== 'firestore.googleapis.com') throw new Error('Unexpected network call in migration test.');
  return nativeFetch(`${proxy}${url.pathname}`, options);
};
