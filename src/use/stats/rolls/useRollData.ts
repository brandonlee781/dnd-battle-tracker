import { Ref, computed, ComputedRef } from '@vue/composition-api'
import { PC, RollData } from '@/store'
import { DisplayType } from '../useBattleData'
import capitalize from '@/helpers/capitalize'
import { nonNullable } from '../useBattleTableData'

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

export const colors = [
  '#F44336',
  '#9C27B0',
  '#3F51B5',
  '#00BCD4',
  '#4CAF50',
  '#CDDC39',
  '#FFEB3B',
]

export interface RollCollection extends Omit<RollData, 'player'> {
  player: PC
}

interface UseRollDataParams {
  party: PC[]
  rolls: Ref<RollData[]>
  display: Ref<DisplayType>
  selectedSkill: Ref<string | null>
}

interface RollSeries {
  name?: string
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
  rolls,
  display,
  selectedSkill,
}: UseRollDataParams) {
  const skillData: ComputedRef<RollCollection[]> = computed(() => {
    return rolls.value
      .filter(c => c.type === 'skill')
      .map(roll => {
        const player = party.find(p => p.id === roll.player)
        if (player) {
          return {
            ...roll,
            player,
          }
        }
      })
      .filter(nonNullable)
  })
  const saveData: ComputedRef<RollCollection[]> = computed(() => {
    return rolls.value
      .filter(c => c.type === 'save')
      .map(roll => {
        const player = party.find(p => p.id === roll.player)
        if (player) {
          return {
            ...roll,
            player,
          }
        }
      })
      .filter(nonNullable)
  })

  const skillOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: !selectedSkill.value,
      position: 'bottom',
      labels: {
        fontColor: '#ccc',
      },
    },
    title: {
      display: true,
      text: `${
        selectedSkill.value ? selectedSkill.value : 'Skill'
      } Roll ${capitalize(display.value)}`,
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

  const skillDataSets = computed(() => {
    if (selectedSkill.value) {
      return {
        labels: party.map(p => p.name),
        datasets: [
          {
            label: `${capitalize(display.value)} ${selectedSkill.value} Rolls`,
            backgroundColor: colors.slice(0, party.length),
            data: party.map(
              pc =>
                getDisplay(
                  skillData.value.filter(
                    roll =>
                      roll.player.id === pc.id &&
                      roll.skill === selectedSkill.value
                  ),
                  display.value
                ) || 0
            ),
          },
        ],
      }
    } else {
      return {
        labels: skills,
        datasets: party.map((pc, i) => {
          return {
            label: `${pc.name}'s Rolls`,
            backgroundColor: colors[i],
            data: skills.map(skill => {
              return (
                getDisplay(
                  skillData.value.filter(
                    roll => roll.player.id === pc.id && roll.skill === skill
                  ),
                  display.value
                ) || 0
              )
            }),
          }
        }),
      }
    }
  })
  const saveOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'bottom',
      labels: {
        fontColor: '#ccc',
      },
    },
    title: {
      display: true,
      text: 'Skill Rolls',
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
  const saveDataSets = computed(() => {
    const labels = saves
    const datasets = party.map((pc, i) => {
      return {
        label: `${pc.name}'s Rolls`,
        backgroundColor: colors[i],
        data: saves.map(save => {
          return (
            getDisplay(
              saveData.value.filter(
                roll => roll.player.id === pc.id && roll.save === save
              ),
              display.value
            ) || 0
          )
        }),
      }
    })

    return {
      labels,
      datasets,
    }
  })

  return {
    skills,
    saves,
    skillData,
    saveData,
    skillChartData: {
      options: skillOptions,
      chartData: skillDataSets,
    },
    saveChartData: {
      options: saveOptions,
      chartData: saveDataSets,
    },
  }
}
