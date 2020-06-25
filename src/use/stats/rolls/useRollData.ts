import { Ref, ref, watch } from '@vue/composition-api'
import { PC, RollData } from '@/store'
import { ApexOptions } from 'apexcharts'
import { DisplayType } from '../useBattleData'

export const skills = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Slight of Hand',
  'Stealth',
  'Survival',
]

export const saves = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
]

export interface RollCollection extends Omit<RollData, 'player'> {
  player: PC
}

interface UseRollDataParams {
  party: PC[]
  skills: Ref<RollCollection[]>
  saves: Ref<RollCollection[]>
  display: Ref<DisplayType>
}

interface RollSeries {
  name: string
  data: number[]
}

function getDisplay(items: RollCollection[], type: DisplayType) {
  if (type === 'total') {
    return items.reduce((a, b) => a + b.roll, 0)
  }

  if (type === 'average') {
    let average = 0
    items.forEach(it => {
      average += it.roll
    })
    return average / items.length
  }

  if (type === 'high') {
    let high = 0
    items.forEach(it => {
      if (it.roll > high) {
        high = it.roll
      }
    })
    return high
  }
}

export default function({
  party,
  skills: skillData,
  saves: savesData,
  display,
}: UseRollDataParams) {
  const skillOptions: ApexOptions = {
    chart: { id: 'skill-bar-chart', toolbar: { tools: { download: false } } },
    xaxis: {
      categories: skills,
    },
    title: {
      text: 'Skill Rolls',
      align: 'center',
    },
    theme: { mode: 'dark', palette: 'palette1' },
  }
  const saveOptions: ApexOptions = {
    chart: { id: 'saves-bar-chart', toolbar: { tools: { download: false } } },
    xaxis: {
      categories: saves,
    },
    title: {
      text: 'Save Rolls',
      align: 'center',
    },
    theme: { mode: 'dark', palette: 'palette1' },
  }
  const skillSeries: Ref<RollSeries[]> = ref([])
  const saveSeries: Ref<RollSeries[]> = ref([])

  watch([skillData, display], () => {
    skillSeries.value = party.map(pc => {
      return {
        name: pc.name,
        data: skills.map(skill => {
          const skillRoll = getDisplay(
            skillData.value.filter(
              roll => roll.player.id === pc.id && roll.skill === skill
            ),
            display.value
          )
          return skillRoll || 0
        }),
      }
    })
  })
  watch([savesData, display], () => {
    saveSeries.value = party.map(pc => {
      return {
        name: pc.name,
        data: saves.map(save => {
          const saveRoll = getDisplay(
            savesData.value.filter(
              roll => roll.player.id === pc.id && roll.save === save
            ),
            display.value
          )
          return saveRoll || 0
        }),
      }
    })
  })

  return {
    skills,
    saves,
    skillChartData: {
      options: skillOptions,
      series: skillSeries,
    },
    saveChartData: {
      options: saveOptions,
      series: saveSeries,
    },
  }
}
