import { Ref, computed, ComputedRef } from '@vue/composition-api'
import { PC, RollData } from '@/store'
import { DisplayType } from '../useBattleData'
import capitalize from '@/helpers/capitalize'
import { nonNullable } from '../useBattleTableData'
import { getNewColor } from '@/helpers/colors'

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

export const colors = ['#F44336', '#9C27B0', '#3F51B5', '#4CAF50', '#00BCD4']

export interface RollCollection extends Omit<RollData, 'player'> {
  player: PC
}

interface UseRollDataParams {
  party: PC[]
  rolls: Ref<RollData[]>
  display: Ref<DisplayType>
  selectedSkill: Ref<string | null>
  selectedSave: Ref<string | null>
  selectedPlayer: Ref<PC | null>
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
  selectedSave,
  selectedPlayer,
}: UseRollDataParams) {
  const players = computed(() =>
    selectedPlayer.value ? [selectedPlayer.value] : party
  )
  const skillData: ComputedRef<RollCollection[]> = computed(() => {
    return rolls.value
      .filter(c => c.type === 'skill')
      .map(roll => {
        const player = players.value.find(p => p.id === roll.player)
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
        const player = players.value.find(p => p.id === roll.player)
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
      text: `${selectedSkill.value || 'Skill'} Roll ${capitalize(
        display.value
      )}`,
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
        labels: players.value.map(p => p.name),
        datasets: [
          {
            label: `${capitalize(display.value)} ${selectedSkill.value} Rolls`,
            backgroundColor: players.value.map(p => getNewColor(p.name)),
            data: players.value.map(
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
        datasets: players.value.map(pc => {
          return {
            label: `${pc.name}'s Rolls`,
            backgroundColor: getNewColor(pc.name),
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
  const saveOptions = computed(() => ({
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
      text: `${selectedSave.value || 'Save'} Roll ${capitalize(display.value)}`,
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
  const saveDataSets = computed(() => {
    const labels = saves
    if (selectedSave.value) {
      return {
        labels: players.value.map(p => p.name),
        datasets: [
          {
            label: `${capitalize(display.value)} ${selectedSave.value} Rolls`,
            backgroundColor: players.value.map(p => getNewColor(p.name)),
            data: players.value.map(
              pc =>
                getDisplay(
                  saveData.value.filter(
                    roll =>
                      roll.player.id === pc.id &&
                      roll.save === selectedSave.value
                  ),
                  display.value
                ) || 0
            ),
          },
        ],
      }
    } else {
      return {
        labels,
        datasets: players.value.map(pc => {
          return {
            label: `${pc.name}'s Rolls`,
            backgroundColor: getNewColor(pc.name),
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
        }),
      }
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
