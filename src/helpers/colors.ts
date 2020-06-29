import { colors } from '@/use/stats/rolls/useRollData'
import store from '@/store'
import Color from 'color'

export function lightenDarkenColor(col, amt) {
  let usePound = false

  if (col[0] == '#') {
    col = col.slice(1)
    usePound = true
  }

  const num = parseInt(col, 16)

  let r = (num >> 16) + amt

  if (r > 255) r = 255
  else if (r < 0) r = 0

  let b = ((num >> 8) & 0x00ff) + amt

  if (b > 255) b = 255
  else if (b < 0) b = 0

  let g = (num & 0x0000ff) + amt

  if (g > 255) g = 255
  else if (g < 0) g = 0

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
}

function intToRGB(j) {
  let hash = 0
  if (j.length === 0) return ''
  for (let i = 0; i < j.length; i++) {
    hash = j.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const rgb = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 255
    rgb[i] = value
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

export function getNewColor(
  name: string,
  lighten: number | null = null
): string {
  let color
  const partyIndex = store.state.party.findIndex(p => p.name === name)
  if (partyIndex >= 0) {
    color = Color(colors[partyIndex])
  } else {
    color = Color(intToRGB(name))
  }
  if (lighten) {
    const lightened = color.darken(lighten)
    return lightened.rgb().string()
  }
  return color.rgb().string()
}
