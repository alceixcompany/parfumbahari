// Used only by the isolated cache integration process. Never imported by the application.
const nativeFetch = global.fetch;
const proxy = process.env.PARFUM_CACHE_TEST_PROXY;
if (!proxy || !/^http:\/\/127\.0\.0\.1:\d+$/.test(proxy)) throw new Error('A loopback test proxy is required.');
global.fetch = (input, options) => {
  const value = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(value);
  if (['firestore.googleapis.com', 'identitytoolkit.googleapis.com'].includes(url.hostname)) {
    return nativeFetch(`${proxy}${url.pathname}`, options);
  }
  return nativeFetch(input, options);
};
