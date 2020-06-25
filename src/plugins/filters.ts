import Vue from 'vue'
import capitalize from '@/helpers/capitalize'

function getArticle(phrase) {
  let word
  // Getting the first word
  const match = /\w+/.exec(phrase)
  if (match) word = match[0]
  else return 'an ' + phrase

  const lword = word.toLowerCase()
  // Specific start of words that should be preceeded by 'an'
  const altcases = ['honest', 'hour', 'hono']
  for (const i in altcases) {
    if (lword.indexOf(altcases[i]) == 0) return 'an ' + phrase
  }

  // Single letter word which should be preceeded by 'an'
  if (lword.length == 1) {
    if ('aedhilmnorsx'.indexOf(lword) >= 0) return 'an ' + phrase
    else return 'a ' + phrase
  }

  // Capital words which should likely be preceeded by 'an'
  if (
    word.match(
      /(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/
    )
  ) {
    return 'an ' + phrase
  }

  // Special cases where a word that begins with a vowel should be preceeded by 'a'
  const regexes = [
    /^e[uw]/,
    /^onc?e\b/,
    /^uni([^nmd]|mo)/,
    /^u[bcfhjkqrst][aeiou]/,
  ]
  for (const i in regexes) {
    if (lword.match(regexes[i])) return 'a ' + phrase
  }

  // Special capital words (UK, UN)
  if (word.match(/^U[NK][AIEO]/)) {
    return 'a'
  } else if (word == word.toUpperCase()) {
    if ('aedhilmnorsx'.indexOf(lword[0]) >= 0) return 'an ' + phrase
    else return 'a ' + phrase
  }

  // Basic method of words that begin with a vowel being preceeded by 'an'
  if ('aeiou'.indexOf(lword[0]) >= 0) return 'an ' + phrase

  // Instances where y follwed by specific letters is preceeded by 'an'
  if (lword.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/))
    return 'an ' + phrase

  return 'a ' + phrase
}

Vue.filter('withArticle', getArticle)
Vue.filter('capitalize', capitalize)
