const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

router.get('/nearbysearch', async (req, res) => {
  try {
    const { location, radius, type } = req.query;

    if (!location || !radius || !type) {
      return res.status(400).json({ error: 'Missing required query parameters: location, radius, type' });
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Google Places API error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in Google Places proxy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
