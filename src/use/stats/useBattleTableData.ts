import { computed } from '@vue/composition-api'

import { ActionTableItem } from '@/components/stats/ActionTable.vue'
import capitalize from '@/helpers/capitalize'

export interface DataTableHeader {
  text: string
  value: string
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

export default function(battles, field) {
  const fieldName = computed(() => field)
  const headers = computed(() => {
    const headers: DataTableHeader[] = [
      { text: 'Round', value: 'round' },
      { text: 'Turn', value: 'turn' },
      { text: 'Character', value: 'character' },
      { text: 'Target', value: 'target' },
      { text: capitalize(fieldName.value), value: fieldName.value },
    ]
    if (battles.value.length > 1) {
      return [{ text: 'Battle', value: 'battle' }, ...headers]
    }
    return headers
  })

  const actions = computed(() => {
    return battles.value
      .map(battle => {
        const { turns, name } = battle
        const actions: ActionTableItem[] = turns
          .map(t => {
            const { round, turn, character } = t
            return t.action.map(a => {
              return {
                battle: name,
                character: character.name,
                round,
                turn,
                target: a.target.name,
                [fieldName.value]: a[fieldName.value],
              }
            })
          })
          .reduce((a, b) => a.concat(b), [])
          .filter(nonNullable)
        return actions
      })
      .reduce((a, b) => a.concat(b), [])
  })

  return {
    headers,
    actions,
  }
}
