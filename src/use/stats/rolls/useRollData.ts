import { Ref, computed, ComputedRef } from '@vue/composition-api'
import { PC, RollData } from '@/store'
import { DisplayType } from '../useBattleData'
import capitalize from '@/helpers/capitalize'
import { nonNullable } from '../useBattleTableData'
import { getNewColor } from '@/helpers/colors'
import { ChartOptions } from 'chart.js'

interface LabelNode {
  label: string
  expand?: boolean | 'focus'
  children?: SubLabelNode[]
}

declare type SubLabelNode = LabelNode | string

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

export const skillHeirarchy: LabelNode[] = [
  {
    label: 'Strength',
    children: ['Athletics'],
  },
  {
    label: 'Dexterity',
    children: ['Acrobatics', 'Sleight of Hand', 'Stealth'],
  },
  {
    label: 'Constitution',
    children: [],
  },
  {
    label: 'Intelligence',
    children: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'],
  },
  {
    label: 'Wisdom',
    children: [
      'Animal Handling',
      'Insight',
      'Medicine',
      'Perception',
      'Survival',
    ],
  },
  {
    label: 'Charisma',
    children: ['Deception', 'Intimidation', 'Performance', 'Persuasion'],
  },
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

  const skillOptions: Ref<ChartOptions> = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: !selectedSkill.value,
      position: 'top',
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
    layout: {
      padding: {
        bottom: selectedSkill.value ? 0 : 20,
      },
    },
    scales: {
      xAxes: [
        {
          type: selectedSkill.value ? 'linear' : 'hierarchical',
          offset: false,
          gridLines: { color: 'rgba(255, 255, 255, 0.2)' },
          ticks: {
            fontColor: '#ccc',
            beginAtZero: true,
          },
        },
      ],
      yAxes: [
        {
          gridLines: { color: 'rgba(255, 255, 255, 0.2)' },
          ticks: {
            fontColor: '#ccc',
            beginAtZero: true,
          },
        },
      ],
    },
    plugins: {
      datalabels: {
        color: '#eee',
        font: {
          weight: 'bold',
        },
        clip: true,
        formatter: function(val) {
          if (val > 0) {
            return Math.round(val)
          }
          return ''
        },
        display: function(ctx) {
          const value = ctx.dataset.data?.[ctx.dataIndex]
          return !!value && value > 0
        },
      },
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
        labels: skillHeirarchy,
        datasets: players.value.map(pc => {
          return {
            label: `${pc.name}'s Rolls`,
            backgroundColor: getNewColor(pc.name),
            barThickness: 15,
            tree: skillHeirarchy.map(skill => {
              return {
                value:
                  getDisplay(
                    skillData.value.filter(
                      roll =>
                        roll.player.id === pc.id && roll.skill === skill.label
                    ),
                    display.value
                  ) || 0,
                children: skill.children?.map(child => ({
                  value:
                    getDisplay(
                      skillData.value.filter(
                        roll => roll.player.id === pc.id && roll.skill === child
                      ),
                      display.value
                    ) || 0,
                })),
              }
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
    plugins: {
      datalabels: {
        color: '#eee',
        formatter: function(val) {
          if (val > 0) {
            return Math.round(val)
          }
          return ''
        },
      },
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
