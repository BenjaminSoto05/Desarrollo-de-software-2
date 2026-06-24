const http = require('http');
const https = require('https');

const server = http.createServer((clientReq, clientRes) => {
  console.log(`[PROXY] ${clientReq.method} ${clientReq.url}`);

  let body = [];
  clientReq.on('data', chunk => body.push(chunk));
  clientReq.on('end', () => {
    const buffer = Buffer.concat(body);
    
    // Clonamos los headers originales
    const headers = { ...clientReq.headers, host: 'sonarqube.inf.uct.cl' };
    
    // 🔥 EL SECRETO: Eliminamos los headers problemáticos que los WAF y Proxies de universidades odian
    delete headers['transfer-encoding'];
    delete headers['expect'];
    // Forzamos un Content-Length estático para que el firewall sepa exactamente el tamaño
    if (buffer.length > 0) {
      headers['content-length'] = buffer.length;
    }

    const options = {
      hostname: 'sonarqube.inf.uct.cl',
      port: 443,
      path: clientReq.url,
      method: clientReq.method,
      headers: headers
    };

    const proxyReq = https.request(options, (res) => {
      console.log(`[PROXY RESPONSE] ${res.statusCode}`);
      clientRes.writeHead(res.statusCode, res.headers);
      res.pipe(clientRes, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[PROXY ERROR]', err);
      clientRes.writeHead(500);
      clientRes.end();
    });

    // Enviamos el body completo de una sola vez, sin chunks
    if (buffer.length > 0) {
      proxyReq.write(buffer);
    }
    proxyReq.end();
  });
});

server.listen(9000, () => {
  console.log('🚀 Local Proxy BUFFERING mode running on http://localhost:9000');
});
