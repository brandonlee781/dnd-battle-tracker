import { Ref, ComputedRef, computed } from '@vue/composition-api'
import { Battle, Character } from '@/store'
import { FieldType, getNewColor } from './useBattleData'
import { getCombatantsTurns } from './useFightData'
import capitalize from '@/helpers/capitalize'
import { nonNullable } from './useBattleTableData'

interface UseCombatantsDataProps {
  battles: Ref<Battle[]>
  combatants: ComputedRef<Character[]>
  field: FieldType
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

function getSelectedColor(name) {
  const col = getNewColor(name)
  const match = col.match(/rgb\((.*)\)/i)
  if (match?.length && match?.length > 1) {
    return {
      backgroundColor: `rgba(${match[1]}, 0.3)`,
      pointBackgroundColor: col,
      pointBorderColor: '#bbb',
      borderColor: col,
    }
  }
  return {
    backgroundColor: `${col}22`,
    pointBackgroundColor: col,
    pointBorderColor: '#bbb',
    borderColor: col,
  }
}

export default function({
  combatants,
  battles,
  field,
  selectedCombatant,
}: UseCombatantsDataProps) {
  const againstData = computed(() => {
    const selectedId = selectedCombatant.value?.id
    if (selectedId) {
      const chars = combatants.value
        .map(c => c.id)
        .filter(id => id !== selectedId)
      const turnsAsChar = battles.value
        .map(b => b.turns)
        .reduce((a, b) => a.concat(b), [])
        .filter(turn => turn.character.id === selectedId)
        .map(turn => {
          const turnWithActions = {
            ...turn,
            action: turn.action.filter(a => a[field] > 0),
          }
          if (turnWithActions.action.length) {
            return turnWithActions
          }
          return null
        })
        .filter(nonNullable)

      return chars.map(charId => {
        const actions = turnsAsChar
          .map(turn => turn.action)
          .reduce((a, b) => a.concat(b), [])
          .filter(ac => {
            return ac.target?.id === charId
          })
        if (actions.length) {
          return actions.reduce((a, b) => a + b[field], 0)
        }
        return 0
      })
    }
    return []
  })
  const fromData = computed(() => {
    const selectedId = selectedCombatant.value?.id
    if (selectedId) {
      const chars = combatants.value
        .map(c => c.id)
        .filter(id => id !== selectedId)
      const turnsAsTarget = battles.value
        .map(b => b.turns)
        .reduce((a, b) => a.concat(b), [])
        .map(turn => {
          // filter out all actions that aren't the selected combatant
          // and aren't the requested field
          const turnWithActions = {
            ...turn,
            action: turn.action.filter(
              a => a.target?.id === selectedId && a[field] > 0
            ),
          }
          if (turnWithActions.action.length) {
            return turnWithActions
          }
          return null
        })
        .filter(nonNullable)

      return chars.map(charId => {
        const actions = turnsAsTarget
          .filter(turn => {
            return turn.character.id === charId
          })
          .map(t => t.action)
          .reduce((a, b) => a.concat(b), [])
        if (actions.length) {
          return actions.reduce((a, b) => a + b[field], 0)
        }
        return 0
      })
    }
    return []
  })
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

    const curr = combatants.value[index]
    return {
      labels: combatants.value
        .filter(c => c.id !== selectedCombatant.value?.id)
        .map(c => c.name),
      datasets: [
        {
          label: curr.name,
          ...getSelectedColor(selectedCombatant.value.name),
          data: againstData.value,
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
          ...getSelectedColor(selectedCombatant.value.name),
          data: fromData.value,
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
          text: `${capitalize(field)} Against Target`,
          fontColor: '#ccc',
        },
      },
    },
    fromData: {
      options: {
        ...options,
        title: {
          display: true,
          text: `${capitalize(field)} From Target`,
          fontColor: '#ccc',
        },
      },
      chartData: fromChartData,
    },
  }
}
