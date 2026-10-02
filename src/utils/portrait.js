// image_url is either a portrait folder ("/droids/<slug>/", one <tier>.webp per tier)
// or a single image URL used for every tier.
export function portraitUrl(imageUrl, tier = 'base') {
  if (!imageUrl) return null
  if (!imageUrl.endsWith('/')) return imageUrl
  // No Kyber art exists yet — show the Stellar portrait inside the Kyber frame
  return `${imageUrl}${tier === 'kyber' ? 'stellar' : tier}.webp`
}
