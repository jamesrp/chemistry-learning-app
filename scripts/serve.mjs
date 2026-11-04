// Serves dist/ for local play: npm start, then open http://127.0.0.1:4188.
// It listens on the local network too, so an iPad on the same Wi-Fi can open
// the Mac's address (http://<mac-ip>:4188).
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, sep} from 'node:path';

const root = resolve(import.meta.dirname, '../dist');
const types = {html: 'text/html; charset=utf-8', js: 'text/javascript', css: 'text/css', json: 'application/json', svg: 'image/svg+xml', png: 'image/png'};
const port = Number(process.env.PORT || 4188);

http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(root + sep)) throw Object.assign(new Error('bad path'), {code: 'ENOENT'});
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type': types[file.split('.').at(-1)] || 'application/octet-stream', 'Cache-Control': 'no-cache'});
    res.end(body);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500, {'Content-Type': 'text/plain'});
    res.end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`Chem Studio: http://127.0.0.1:${port}`));
