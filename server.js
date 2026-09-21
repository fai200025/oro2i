import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve static assets from both subdirectories and root
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use(express.static(__dirname, { extensions: ['html'] }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Deadline Radar' });
});

// Fallback to index.html for unmatched GET routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Deadline Radar server running on http://${HOST}:${PORT}`);
});
