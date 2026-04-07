/**
 * Curated pool of 45 Theo Twitch bingo items.
 * Each item is a funny recurring moment from Theo's Twitch livestreams.
 * The center item is "Gets nerdsniped" which is always placed at position 12 (center of 5x5 grid).
 */

export const CENTER_ITEM = 'Gets nerdsniped' as const

export const BINGO_ITEMS: readonly string[] = [
  // The center item — always placed at index 12
  CENTER_ITEM,
  // The remaining 44 items are shuffled and 24 are picked for the board
  'Crashes out over Anthropic',
  'Gets someone a job / to SF',
  'Forgets to take out tea bag',
  'Leaks his email / API key',
  'Goes on an extended skateboard tangent',
  'Calls a viewer "motherfucker"',
  'Goes "WHAT THE FUCK!?!" at some company',
  "Hasn't had time to do his hair",
  'Someone builds something for Theo and he falls in love',
  'Does the "don\'t credit me, you did all the work" thing',
  'Gets trolled by his team',
  'Mentions t3.gg',
  'Rants about TypeScript for 5+ minutes',
  'Blames Rust for something unrelated',
  'Starts a side project on stream',
  'Reviews a viewer\'s PR',
  'Mentions "golden path"',
  'Roasts a tech startup',
  'Gets distracted by chat and forgets what he was doing',
  'Mentions how much he loves his team',
  'Debates hiring someone live on stream',
  'Complains about build times',
  'Talks about how bad most software is',
  'Brings up the fountain again',
  'Gets emotional about open source',
  'Mentions living in San Francisco',
  'Switches between 3+ editor windows rapidly',
  'Accidentally closes the wrong tab',
  'Says "let me just..." then spends 20 minutes on it',
  'Talks about his streaming setup',
  'Mentions cargo culting',
  'Argues with chat about tabs vs spaces',
  'Gets excited about a new framework then abandons it',
  'Discusses Vercel or Next.js',
  'Says "this is actually really simple" about something complex',
  'Brings up the state of web development',
  'References a previous stream or video',
  'Does the "I\'m not mad, I\'m just disappointed" look',
  'Mentions Bun as the future of JavaScript',
  'Talks about AI coding assistants',
  'Goes on a tangent about design/UX',
  'Shows off a keyboard or mechanical keyboard take',
  'Says something self-deprecating about his coding speed',
  'Gets nerdsniped into a rabbit hole on stream',
] as const
