# Restaurant DeLuca Website

A multi-page marketing site for Restaurant DeLuca located in the centre of The Hague. The experience is designed to feel elegant and
sensual, pairing deep midnight tones with champagne gold accents.

## Pages
- **Home** – Hero imagery, highlights, testimonials, and a map embed.
- **Menu** – Seasonal selections across antipasti, primi, secondi, and dolci alongside wine highlights.
- **Reservation** – Google Calendar–powered availability viewer with a booking form that creates events in the restaurant calendar.
- **About** – Story, philosophy, and milestone timeline.

## Running locally
Open `index.html` in your browser using a local web server (for example, `python3 -m http.server`). All assets are static.

## Google Calendar integration
1. Create a Google Cloud project and enable the Calendar API.
2. Generate an API key and OAuth 2.0 Client ID (type: Web application). Authorize the domain you will host the site on.
3. Share the reservation calendar with the OAuth client so it can read and create events.
4. Update the placeholders in `assets/js/reservation.js`:
   - `YOUR_GOOGLE_API_KEY`
   - `YOUR_GOOGLE_CLIENT_ID`
   - `calendarId`
5. Deploy the site and test the reservation form. Guests will be asked to sign in with Google before confirming a booking.

## Customisation
- Edit colours and typography via CSS variables in `assets/css/style.css`.
- Update imagery by swapping the Unsplash URLs in the HTML files or by adding assets to `assets/images/`.

## License
This project is provided as-is for demonstration purposes.
