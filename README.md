# Suncoast Capital Mortgage

Production source for https://suncoastcapitalmortgage.com.

## Netlify deployment

Connect this GitHub repository to Netlify using the `main` branch. The root `netlify.toml` already sets:

- Publish directory: `suncoast-site`
- Functions directory: `suncoast-site/netlify/functions`

No build command is required for the static site.

After the first Git-based deploy, set `suncoastcapitalmortgage.com` as the primary custom domain in Netlify. Keep the existing South Florida acquisition domains as aliases/redirect sources according to `suncoast-site/_redirects`.

## Canonical South Florida pages

- `/miami-dade-county-mortgage`
- `/broward-county-mortgage`
- `/palm-beach-county-mortgage`

Florida Keys / Monroe County remains routed to the dedicated K West Mortgage experience.
