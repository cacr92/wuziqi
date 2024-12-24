export default async function handler(req, res) {
  const urls = [
    '/',
    '/assets/index.js',
    '/assets/vendor.js',
    '/assets/game.js',
    '/assets/index.css'
  ]

  try {
    await Promise.all(
      urls.map(url =>
        fetch(url, {
          method: 'GET',
          headers: { 
            'Cache-Control': 'public, max-age=31536000',
            'Pragma': 'no-cache'
          }
        })
      )
    )
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
} 