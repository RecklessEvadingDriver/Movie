const path = require('path');
const express = require('express');
const { getStreams } = require('./castle');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const movies = [
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: 2014,
    tmdbId: '157336',
    mediaType: 'movie',
    tags: ['Sci‑Fi', 'Drama', 'Adventure'],
    runtime: '169 min',
    rating: 'PG-13',
    synopsis:
      'A team travels through a wormhole in search of a new home for humanity as Earth nears collapse.',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    poster:
      'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  {
    id: 'the-mandalorian',
    title: 'The Mandalorian',
    year: 2019,
    tmdbId: '82856',
    mediaType: 'tv',
    season: 1,
    episode: 1,
    tags: ['Sci‑Fi', 'Action', 'Space'],
    runtime: '39 min',
    rating: 'TV-14',
    synopsis:
      'A lone bounty hunter navigates the outer reaches of the galaxy, far from the authority of the New Republic.',
    hlsUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    poster:
      'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg'
  },
  {
    id: 'the-matrix',
    title: 'The Matrix',
    year: 1999,
    tmdbId: '603',
    mediaType: 'movie',
    tags: ['Action', 'Sci‑Fi', 'Cyberpunk'],
    runtime: '136 min',
    rating: 'R',
    synopsis:
      'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
    hlsUrl: 'https://test-streams.mux.dev/bbb.m3u8',
    poster:
      'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
  }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/hls.min.js', (_req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules', 'hls.js', 'dist', 'hls.min.js'));
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/movies', (_req, res) => {
  res.json({ data: movies });
});

app.get('/api/streams', async (req, res) => {
  const { tmdbId, type = 'movie', season, episode } = req.query;

  if (!tmdbId) {
    return res.status(400).json({ error: 'tmdbId query param is required' });
  }

  try {
    const seasonNum = season ? parseInt(season, 10) : undefined;
    const episodeNum = episode ? parseInt(episode, 10) : undefined;
    const streams = await getStreams(tmdbId, type, seasonNum, episodeNum);

    if (!streams || streams.length === 0) {
      return res.status(404).json({ error: 'No streams found' });
    }

    res.json({ data: streams });
  } catch (error) {
    console.error('[api/streams] Failed to load streams');
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find((entry) => entry.id === req.params.id);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json({ data: movie });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Movie server listening on http://localhost:${PORT}`);
});
