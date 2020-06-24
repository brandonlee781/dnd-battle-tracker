import { Battle } from '@/store'
import _ from 'lodash'
import { computed, ComputedRef, Ref, ref, watch } from '@vue/composition-api'
import { ApexOptions } from 'apexcharts'

import useCombatantData from './useCombatantData'
import useFightData from './useFightData'
import useRoundData from './useRoundData'

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
}

export default function({
  battles = ref([]),
  field = 'damage',
  display = ref('total'),
}: UseBattleDataProps = {}) {
  // get all combatants
  const combatants = computed(() => {
    const combs = battles.value
      .map(b => b.combatants)
      .reduce((a, b) => a.concat(b), [])
    return _.uniqBy(combs, i => i.id)
  })

  const combatantData = useFightData({
    battles,
    combatants,
    field,
  })

  const {
    againstData: pointsAgainstData,
    fromData: pointsFromData,
  } = useCombatantData({
    combatants,
    battles,
    field,
  })

  const barChartData = computed(() => {
    const label = `${display.value.charAt(0).toUpperCase() +
      display.value.slice(1)} ${field.charAt(0).toUpperCase() + field.slice(1)}`
    const options: ApexOptions = {
      chart: { id: 'damage-bar', toolbar: { tools: { download: false } } },
      xaxis: {
        categories: combatantData[display.value].value.map(t => t.text),
      },
      title: {
        text: `${field.charAt(0).toUpperCase() + field.slice(1)} Per Combatant`,
        align: 'center',
      },
      theme: { mode: 'dark', palette: 'palette1' },
    }
    const series = [
      {
        name: label,
        data: combatantData[display.value].value.map(t => t.value),
      },
    ]
    return {
      options,
      series,
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
        })
      }
    },
    { immediate: true }
  )

  return {
    combatants,
    barChartData,
    pointsAgainstData,
    pointsFromData,
    roundData,
  }
}
