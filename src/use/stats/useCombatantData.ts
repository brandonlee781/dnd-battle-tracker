import { Ref, ComputedRef, computed } from '@vue/composition-api'
import { Battle, Character } from '@/store'
import { FieldType } from './useBattleData'
import { getCombatantsTurns } from './useFightData'
import { ApexOptions } from 'apexcharts'
import capitalize from '@/helpers/capitalize'

interface UseCombatantsDataProps {
  battles: Ref<Battle[]>
  combatants: ComputedRef<Character[]>
  field: FieldType
}

interface TargetData {
  [name: string]: number
}

const getTargetObject = (combatants: Character[]): TargetData => {
  const targets = {}
  combatants.forEach(c => {
    targets[c.id] = 0
  })
  return targets
}

export default function({
  combatants,
  battles,
  field,
}: UseCombatantsDataProps) {
  const categories = computed(() => combatants.value.map(c => c.name))
  const againstSeries = computed(() =>
    combatants.value.map(c => {
      const turns = getCombatantsTurns(battles.value, c)
      const targets = getTargetObject(combatants.value)

      Object.keys(targets).forEach(targetId => {
        const actions = turns
          .map(t => t.action)
          .reduce((a, b) => a.concat(b), [])
          .filter(action => action.target.id === targetId)
        targets[targetId] = actions.reduce((a, b) => a + b[field], 0)
      })

      return {
        id: c.id,
        name: `${c.name} ${capitalize(field)} outgoing`, // eslint-disable-line
        data: Object.keys(targets).map(target => targets[target]),
      }
    })
  )
  const fromSeries = computed(() =>
    combatants.value.map(c => {
      const chars = getTargetObject(combatants.value)
      const turnsAsTarget = battles.value
        .map(b => b.turns)
        .reduce((a, b) => a.concat(b), [])
        .filter(turn => {
          const actions = turn.action.filter(a => a.target.id === c.id)
          return actions.length
        })
        .map(turn => ({
          ...turn,
          action: turn.action.filter(a => a.target.id === c.id),
        }))
      turnsAsTarget.forEach(turn => {
        chars[turn.character.id] = turn.action.reduce((a, b) => a + b[field], 0)
      })

      return {
        id: c.id,
        name: `${c.name} ${capitalize(field)} incoming`, // eslint-disable-line
        data: Object.keys(chars).map(char => chars[char]),
      }
    })
  )

  const options: Ref<ApexOptions> = computed(() => ({
    chart: { id: `${field}-radar`, toolbar: { tools: { download: false } } },
    xaxis: {
      categories: categories.value,
    },
    dataLabels: {
      enabled: true,
    },
    theme: { mode: 'dark', palette: 'palette1' },
  }))
  return {
    againstData: {
      series: againstSeries,
      options,
    },
    fromData: {
      options,
      series: fromSeries,
    },
  }
}
