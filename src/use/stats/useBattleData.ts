import { Battle, Character } from '@/store'
import _, { capitalize } from 'lodash'
import { computed, ComputedRef, Ref, ref, watch } from '@vue/composition-api'

import useCombatantData from './useCombatantData'
import useFightData from './useFightData'
import useRoundData from './useRoundData'
import { colors } from './rolls/useRollData'

export interface BattleData {
  text: string
  value: number
}

export type FieldType = 'damage' | 'healing'
export type DisplayType = 'total' | 'average' | 'high'

interface UseBattleDataProps {
  battles?: ComputedRef<Battle[]>
  field?: FieldType
  display?: Ref<DisplayType>
  selectedCombatant?: Ref<Character | null>
  colors?: string[]
}

export const getColors = length =>
  new Array(length).fill(0).map((u, i) => {
    if (colors[i]) {
      return colors[i]
    }
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`
  })

export default function({
  battles = ref([]),
  field = 'damage',
  display = ref('total'),
  selectedCombatant = ref(null),
  colors = [],
}: UseBattleDataProps = {}) {
  // get all combatants
  const combatants = computed(() => {
    const combs = battles.value
      .map(b => b.combatants)
      .reduce((a, b) => a.concat(b), [])
    return _.uniqBy(combs, i => i.id)
  })

  const backgroundColors = computed(() =>
    colors.length ? colors : getColors(combatants.value.length)
  )

  const combatantData = useFightData({
    battles,
    combatants,
    field,
  })

  const { againstData, fromData } = useCombatantData({
    combatants,
    battles,
    field,
    colors: backgroundColors,
    selectedCombatant,
  })

  const barChartData = computed(() => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${capitalize(display.value)} ${capitalize(field)} per Combatant`,
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
    }
    return {
      options,
      chartData: {
        labels: combatants.value.map(c => c.name),
        datasets: [
          {
            backgroundColor: backgroundColors.value,
            data: combatantData[display.value].value.map(t => t.value),
          },
        ],
      },
    }
  })
  const roundData: any = ref({
    options: {},
    series: [],
  })
  watch(
    battles,
    () => {
      if (battles.value.length === 1) {
        roundData.value = useRoundData({
          battles,
          field,
          colors: backgroundColors.value,
        })
      }
    },
    { immediate: true }
  )

  return {
    combatants,
    barChartData,
    againstData,
    fromData,
    roundData,
    colors: backgroundColors.value,
  }
}
