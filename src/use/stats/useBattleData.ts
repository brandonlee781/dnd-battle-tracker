import { Battle, Character } from '@/store'
import _, { capitalize } from 'lodash'
import { computed, ComputedRef, Ref, ref, watch } from '@vue/composition-api'

import useCombatantData from './useCombatantData'
import useFightData from './useFightData'
import useRoundData from './useRoundData'
import { colors } from './rolls/useRollData'
import store from '@/store'
import { ChartOptions, ChartData } from 'chart.js'

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
}

interface RoundData {
  options: ComputedRef<ChartOptions> | {}
  chartData: ComputedRef<ChartData> | {}
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

export function getNewColor(name) {
  const partyIndex = store.state.party.findIndex(p => p.name === name)
  if (partyIndex >= 0) {
    return colors[partyIndex]
  }
  const rgb = intToRGB(name)
  return rgb
}

export default function({
  battles = ref([]),
  field = 'damage',
  display = ref('total'),
  selectedCombatant = ref(null),
}: UseBattleDataProps = {}) {
  // get all combatants
  const combatants = computed(() => {
    const combs = battles.value
      .map(b => b.combatants)
      .reduce((a, b) => a.concat(b), [])
    return _.uniqBy(combs, i => i.id)
  })

  const backgroundColors = computed(() =>
    combatants.value.map(({ name }) => getNewColor(name))
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
        text: `${capitalize(field)} per Combatant`,
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
        labels: combatants.value.map(
          c => `${c.name}${c.count ? ` x${c?.count}` : ''}`
        ),
        datasets: [
          {
            backgroundColor: backgroundColors.value,
            data: combatantData[display.value].value.map(t => t.value),
          },
        ],
      },
    }
  })
  const roundData: Ref<RoundData> = ref({
    options: {},
    chartData: {},
  })
  watch(
    battles,
    () => {
      if (battles.value.length === 1) {
        roundData.value = useRoundData({
          battles,
          field,
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
  }
}
