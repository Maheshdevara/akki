const express = require('express');
const path = require('path');

const app = express();
const DEFAULT_PORT = process.env.PORT || 3000;

// Serve static assets from root and public directory
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Navigation & page metadata for all celebration pages
const PAGES = [
  { id: 0, slug: 'lock', title: 'A Secret Awaits (11:11 Lock)', file: 'index.html', completed: true },
  { id: 1, slug: 'welcome', title: 'The Magical Beginning (Butterfly Portrait)', file: 'page1.html', completed: true },
  { id: 2, slug: 'birthday-wishes', title: 'Birthday Wishes & Floating Balloons', file: 'page2.html', completed: true },
  { id: 3, slug: 'balloon-pop', title: 'Interactive Balloon Pop Surprises', file: 'surprise.html', completed: true },
  { id: 4, slug: 'memory-gallery', title: 'Akshaya Golden Moments Gallery', file: 'page4.html', completed: true },
  { id: 5, slug: 'melody-jukebox', title: 'Birthday Melody & Jukebox', file: 'page5.html', completed: false },
  { id: 6, slug: 'wishes-wall', title: 'Heartfelt Wishes Wall', file: 'page6.html', completed: false },
  { id: 7, slug: 'akshaya-trivia', title: 'How Well Do You Know Akshaya?', file: 'page7.html', completed: false },
  { id: 8, slug: 'celestial-aura', title: 'The Star & Floral Zodiac', file: 'page8.html', completed: false },
  { id: 9, slug: 'time-capsule', title: 'Time Capsule to Future Akshaya', file: 'page9.html', completed: false },
  { id: 10, slug: 'fireworks-finale', title: 'Grand Fireworks Celebration Finale', file: 'page10.html', completed: false }
];

// API endpoint to get pages list
app.get('/api/pages', (req, res) => {
  res.json({
    recipient: 'AKSHAYA',
    age: 25,
    totalPages: PAGES.length,
    pages: PAGES
  });
});

// Route for Secret Universe Lock Entry (Root / and /lock)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/lock', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/lock.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for Page 1 (The Magical Butterfly Portrait)
app.get('/page1', (req, res) => {
  res.sendFile(path.join(__dirname, 'page1.html'));
});
app.get('/page1.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'page1.html'));
});
app.get('/welcome', (req, res) => {
  res.sendFile(path.join(__dirname, 'page1.html'));
});
app.get('/welcome.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'page1.html'));
});

// Route for Page 2 (Happy Birthday Akshaya Celebration)
app.get('/page2', (req, res) => {
  res.sendFile(path.join(__dirname, 'page2.html'));
});
app.get('/page2.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'page2.html'));
});

// Route for Page 3 (surprise / pop all balloons)
app.get('/surprise', (req, res) => {
  res.sendFile(path.join(__dirname, 'surprise.html'));
});
app.get('/surprise.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'surprise.html'));
});
app.get('/page3', (req, res) => {
  res.sendFile(path.join(__dirname, 'surprise.html'));
});
app.get('/page3.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'surprise.html'));
});

// Route for Page 4 (Akshaya's Golden Moments Photo Gallery)
app.get('/page4', (req, res) => {
  res.sendFile(path.join(__dirname, 'page4.html'));
});
app.get('/page4.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'page4.html'));
});

// Route for specific page numbers e.g. /page/1
app.get('/page/:num', (req, res) => {
  const pageNum = parseInt(req.params.num, 10);
  const found = PAGES.find(p => p.id === pageNum);
  if (!found) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  const filePath = path.join(__dirname, 'public', found.file);
  res.sendFile(filePath);
});

// Function to start server with fallback if port is in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🌸 =============================================== 🌸`);
    console.log(`🎂  AKSHAYA's 25th Birthday Celebration Server!   🎂`);
    console.log(`🌐  Server running at: http://localhost:${port}`);
    console.log(`🔒  Secret Entry (Lock): http://localhost:${port}/ (Passcode: 11:11)`);
    console.log(`🦋  Page 1 (Portrait): http://localhost:${port}/page1`);
    console.log(`🎈  Page 2 (Balloons): http://localhost:${port}/page2`);
    console.log(`💥  Page 3 (Pop Game): http://localhost:${port}/page3`);
    console.log(`📸  Page 4 (Memories): http://localhost:${port}/page4`);
    console.log(`🌸 =============================================== 🌸`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
