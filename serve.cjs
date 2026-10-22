const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
http.createServer((req,res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (url === '/' ? '/index.html' : url));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file,(error,bytes) => {
    res.writeHead(error ? 404 : 200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});
    res.end(error ? 'Not found' : bytes);
  });
}).listen(4186,'127.0.0.1',() => console.log('RK Finance: http://127.0.0.1:4186 — Ctrl+C to stop'));
