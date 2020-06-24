import { FieldType } from './useBattleData'
import { Battle } from '@/store'
import { ComputedRef, computed, Ref, toRefs } from '@vue/composition-api'
import { ApexOptions } from 'apexcharts'

interface UseRoundDataProps {
  battles: Ref<Battle[]> | ComputedRef<Battle[]>
  field: FieldType
}

export default function({ battles, field }: UseRoundDataProps) {
  const battle = computed(() => battles.value[0])
  const maxRounds = computed(() => {
    let count = 0
    battle.value.turns.forEach(turn => {
      if (turn.round > count) {
        count = turn.round
      }
    })
    return count
  })

  const data = computed(() => {
    const combatants = battle.value.combatants
    const roundValues = {}
    combatants?.forEach(combatant => {
      roundValues[combatant.id] = {
        name: `${combatant.name} ${field}`,
        data: [],
      }
      for (let i = 1; i <= maxRounds.value; i++) {
        const datum = battle.value.turns
          .filter(t => t.round === i)
          .find(turn => turn.character.id === combatant.id)
          ?.action.reduce((a, b) => a + b[field], 0)
        roundValues[combatant.id].data.push(datum || 0)
      }
    })

    return roundValues
  })

  const options: ComputedRef<ApexOptions> = computed(() => ({
    chart: { id: 'damage-bar', toolbar: { tools: { download: false } } },
    xaxis: {
      categories: [...new Array(maxRounds.value).fill(0)].map((v, i) => {
        return `Round ${i + 1}`
      }),
    },
    title: {
      text: `${field.charAt(0).toUpperCase() + field.slice(1)} Per Rounds`,
      align: 'center',
    },
    theme: { mode: 'dark', palette: 'palette1' },
  }))

  const series = computed(() => {
    return Object.keys(data.value).map(k => data.value[k])
  })

  return {
    options,
    series,
  }
}
