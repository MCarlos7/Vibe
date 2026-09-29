import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import os from 'os';
import Gun from 'gun';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = 3000;
const GUN_PORT = 8765;

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIp();

app.prepare().then(() => {
  // Servidor 1: Next.js (Interfaz Gráfica)
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════');
    console.log('\x1b[32m%s\x1b[0m', '🚀 VIBE JUKEBOX - SERVIDO EN RED LOCAL');
    console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════');
    console.log(` 💻 Host (Esta PC):  http://localhost:${PORT}`);
    console.log(` 📱 Invitados (QR):  http://${LOCAL_IP}:${PORT}`);
    console.log(` 📺 Proyector (TV):  http://localhost:${PORT}/tv`);
  });

  // Servidor 2: Gun.js (Motor P2P Independiente)
  const gunServer = createServer();
  gunServer.listen(GUN_PORT, '0.0.0.0', () => {
    console.log(` 🔫 Nodo P2P (Gun):  http://${LOCAL_IP}:${GUN_PORT}/gun`);
    console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════');
  });
  
  Gun({ web: gunServer, file: 'vibe-db-data' });
});