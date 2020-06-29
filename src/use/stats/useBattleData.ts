import { Battle, Character } from '@/store'
import uniqBy from 'lodash/uniqBy'
import Color from 'color'
import { computed, ComputedRef, Ref, ref, watch } from '@vue/composition-api'

import useCombatantData from './useCombatantData'
import useFightData from './useFightData'
import useRoundData from './useRoundData'
import { ChartOptions, ChartData } from 'chart.js'
import capitalize from '@/helpers/capitalize'
import { getNewColor } from '@/helpers/colors'

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
    return uniqBy(combs, i => i.id)
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
    const options: ChartOptions = {
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
            stacked: display.value === 'total',
          },
        ],
        yAxes: [
          {
            gridLines: { color: 'rgba(255, 255, 255, 0.2)' },
            ticks: {
              fontColor: '#ccc',
            },
            stacked: display.value === 'total',
          },
        ],
      },
      plugins: {
        datalabels: {
          labels: {
            value: {
              color: function(ctx) {
                const color = Color(
                  ctx.dataset.backgroundColor[ctx.dataIndex]
                ).luminosity()
                if (color < 0.5) {
                  return '#eee'
                } else {
                  return '#333'
                }
              },
              formatter: function(value) {
                if (value !== 0) {
                  return value
                }
                return ''
              },
            },
            total: {
              color: '#eee',
              anchor: 'end',
              align: 'end',
              clip: true,
              formatter: function(value, ctx) {
                const total = ctx.chart.$totalizer.totals[ctx.dataIndex]
                if (total > 0) {
                  return total
                }
                return ''
              },
              display: function(ctx) {
                return ctx.datasetIndex === ctx.chart.$totalizer.utmost
              },
            },
          },
        },
      },
    }
    let datasets
    if (display.value === 'total') {
      let max = 0
      combatantData.total.value.forEach(v => {
        if (v.length > max) {
          max = v.length
        }
      })
      datasets = new Array(max).fill(0).map((v, i) => ({
        label: '',
        backgroundColor: [],
        stackLabel: `Stack ${i}`,
        data: [],
      }))
      /**
       * datasets: [
       *  {
       *    label: '0',
       *    data: [chandra, demi, elryn, kal, val, ...]
       *  },
       *  {
       *    label: '1',
       *    data: [chandra, demi, elryn, kal, val, ...]
       *  }
       * ]
       */
      combatantData.total.value.forEach(totals => {
        for (let i = 0; i < max; i++) {
          const data = totals[i]
          if (data) {
            const lightenAmount = (0.5 / max) * i
            datasets[i].backgroundColor.push(
              getNewColor(data.text, lightenAmount)
            )
            datasets[i].data.push(data.value)
          } else {
            datasets[i].backgroundColor.push(getNewColor(`${i}`))
            datasets[i].data.push(0)
          }
        }
      })
    } else {
      datasets = [
        {
          backgroundColor: backgroundColors.value,
          data: combatantData[display.value].value.map(t => t.value),
        },
      ]
    }
    return {
      options,
      chartData: {
        labels: combatants.value.map(
          c => `${c.name}${c.count ? ` x${c?.count}` : ''}`
        ),
        datasets,
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
