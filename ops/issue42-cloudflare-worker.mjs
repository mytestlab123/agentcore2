import html from './index.html';

const documentHtml = String(html);
const contentHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff'
};

export default {
  fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { allow: 'GET, HEAD', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
      });
    }

    const { pathname } = new URL(request.url);
    if (pathname !== '/' && pathname !== '/index.html') {
      return new Response('Not Found', {
        status: 404,
        headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
      });
    }

    return new Response(request.method === 'HEAD' ? null : documentHtml, {
      status: 200,
      headers: contentHeaders
    });
  }
};
