import { FieldType, getNewColor } from './useBattleData'
import { Battle } from '@/store'
import { ComputedRef, computed, Ref } from '@vue/composition-api'
import { ChartOptions, ChartData } from 'chart.js'
import capitalize from '@/helpers/capitalize'

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
        label: `${combatant.name} ${field}`,
        backgroundColor: getNewColor(combatant.name),
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

  const options: ComputedRef<ChartOptions> = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        fontColor: '#ccc',
      },
    },
    title: {
      display: true,
      text: `${capitalize(field)} per Round`,
      fontColor: '#ccc',
    },
    scales: {
      xAxes: [
        {
          gridLines: { color: 'rgba(255, 255, 255, 0.2)' },
          ticks: {
            fontColor: '#ccc',
          },
        },
      ],
      yAxes: [
        {
          gridLines: { color: 'rgba(255, 255, 255, 0.2)' },
          ticks: {
            fontColor: '#ccc',
          },
        },
      ],
    },
  }))

  const chartData: ComputedRef<ChartData> = computed(() => {
    return {
      labels: [...new Array(maxRounds.value).fill(0)].map((v, i) => {
        return `Round ${i + 1}`
      }),
      datasets: Object.keys(data.value).map(k => data.value[k]),
    }
  })

  return {
    options,
    chartData,
  }
}
