export const apiProtect = (req, res, next) => {
  const secFetchMode = req.headers['sec-fetch-mode'];
  const accept = req.headers.accept || '';

  // Deteksi jika akses dilakukan dengan mengetik URL di browser
  const isBrowserNavigation = secFetchMode === 'navigate';

  // Fallback untuk mendeteksi browser: browser selalu mengutamakan text/html saat navigasi
  const isHtmlRequest = accept.includes('text/html') && !req.xhr && !req.headers['x-requested-with'];

  // Izinkan Postman atau alat testing lainnya
  const isPostman = req.headers['postman-token'] || (req.headers['user-agent'] && req.headers['user-agent'].includes('PostmanRuntime'));

  // Blokir jika itu adalah akses langsung dari browser, tapi BUKAN dari postman
  if ((isBrowserNavigation || isHtmlRequest) && !isPostman) {
    return res.status(403).json({
      success: false,
      message: 'Akses API secara langsung dari browser diblokir demi keamanan.'
    });
  }

  next();
};
