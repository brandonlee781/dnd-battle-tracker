import { Ref, ComputedRef, computed } from '@vue/composition-api'
import { Battle, Character } from '@/store'
import { FieldType } from './useBattleData'
import { getCombatantsTurns } from './useFightData'
import capitalize from '@/helpers/capitalize'

interface UseCombatantsDataProps {
  battles: Ref<Battle[]>
  combatants: ComputedRef<Character[]>
  field: FieldType
  colors: Ref<string[]>
  selectedCombatant: Ref<Character | null>
}

interface TargetData {
  [name: string]: number
}

const getTargetObject = (
  combatants: Character[],
  selected: string
): TargetData => {
  const targets = {}
  combatants.forEach(c => {
    if (c.id !== selected) {
      targets[c.id] = 0
    }
  })
  return targets
}

export default function({
  combatants,
  battles,
  field,
  colors,
  selectedCombatant,
}: UseCombatantsDataProps) {
  const againstSeries = computed(() =>
    combatants.value.map(c => {
      const turns = getCombatantsTurns(battles.value, c)
      const targets = getTargetObject(
        combatants.value,
        selectedCombatant.value?.id || ''
      )

      Object.keys(targets).forEach(targetId => {
        const actions = turns
          .map(t => t.action)
          .reduce((a, b) => a.concat(b), [])
          .filter(action => action.target?.id === targetId)
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
      const chars = getTargetObject(
        combatants.value,
        selectedCombatant.value?.id || ''
      )
      const turnsAsTarget = battles.value
        .map(b => b.turns)
        .reduce((a, b) => a.concat(b), [])
        .filter(turn => {
          const actions = turn.action.filter(a => a.target?.id === c.id)
          return actions.length
        })
        .map(turn => ({
          ...turn,
          action: turn.action.filter(a => a.target?.id === c.id),
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
  const againstChartData = computed(() => {
    if (!selectedCombatant.value) {
      return {
        labels: [],
        dataset: [],
      }
    }
    const index = combatants.value.findIndex(
      c => c.id === selectedCombatant.value?.id
    )
    const col = colors.value[index]
    const curr = combatants.value[index]
    return {
      labels: combatants.value
        .filter(c => c.id !== selectedCombatant.value?.id)
        .map(c => c.name),
      datasets: [
        {
          label: curr.name,
          backgroundColor: `${col}22`,
          pointBackgroundColor: col,
          pointBorderColor: '#bbb',
          borderColor: col,
          data: againstSeries.value
            .filter(s => s.id == selectedCombatant.value?.id)
            .map(j => j.data)[0],
        },
      ],
    }
  })

  const fromChartData = computed(() => {
    if (!selectedCombatant.value) {
      return {
        labels: [],
        dataset: [],
      }
    }
    const index = combatants.value.findIndex(
      c => c.id === selectedCombatant.value?.id
    )
    const curr = combatants.value[index]
    return {
      labels: combatants.value
        .filter(c => c.id !== selectedCombatant.value?.id)
        .map(c => c.name),
      datasets: [
        {
          label: curr.name,
          backgroundColor: `${colors.value[index]}22`,
          pointBackgroundColor: colors.value[index],
          pointBorderColor: '#bbb',
          borderColor: colors.value[index],
          data: fromSeries.value
            .filter(s => s.id == selectedCombatant.value?.id)
            .map(j => j.data)[0],
        },
      ],
    }
  })

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scale: {
      ticks: {
        suggestedMin: 0,
        backdropColor: 'rgba(0, 0, 0, 0)',
      },
      pointLabels: {
        fontColor: '#ccc',
      },
      angleLines: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
      gridLines: {
        color: 'rgba(255, 255, 255, 0.2)',
      },
    },
  }
  return {
    againstData: {
      chartData: againstChartData,
      options: {
        ...options,
        title: {
          display: true,
          text: `Damage Against Target`,
          fontColor: '#ccc',
        },
      },
    },
    fromData: {
      options: {
        ...options,
        title: {
          display: true,
          text: `Damage From Target`,
          fontColor: '#ccc',
        },
      },
      chartData: fromChartData,
    },
  }
}
