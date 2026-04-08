/**
 * Curated pool of Theo Twitch bingo items.
 * Each item is a funny recurring moment from Theo's Twitch livestreams.
 * The center item is "Gets nerdsniped" which is always placed at position 12 (center of 5x5 grid).
 */

export const CENTER_ITEM = 'Gets nerdsniped' as const

export const BINGO_ITEMS: readonly string[] = [
  // The center item — always placed at index 12
  CENTER_ITEM,
  // The remaining items are shuffled and 24 are picked for the board
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
  'Debates hiring someone live on stream',
  'Does the "I\'m not mad, I\'m just disappointed" look',
  'Stream starts late',
  'Times someone out',
  'Bans someone',
  'Checks youtube chat',
  'Offers a viewer a bet',
  'Gets angry at FFmpeg Twitter',
  'Mentions T3 Code',
  'Mentions T3.chat',
  'Edges chat with an unpublished project',
  'Has to adjust AC',
  'Goes on a lengthy cam tangent',
  'Gives a non-TS language shit',
  'Mentions the "counter guy"',
  'Introduces the new best model',
  'Crashes out over Apple',
  'Crashes out over Android',
  'Declares something is dying',
  'Gives up on sponsor segway after 3 tries',
  'Asks chat to keep a secret'

] as const
