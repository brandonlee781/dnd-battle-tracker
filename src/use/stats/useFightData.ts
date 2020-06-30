import { Battle, BattleTurn, Character, BattleAction } from '@/store'
import { computed } from '@vue/composition-api'
import { FieldType, BattleData } from './useBattleData'

function getAverage(nums: number[]) {
  if (!nums.length) return 0
  const len = nums.filter(n => n).length
  const total = nums.reduce((a, b) => a + b, 0)

  return total / len
}

export function perAction(turns: BattleTurn[], cb: Function) {
  turns.forEach(turn => {
    turn.action.forEach((a: BattleAction) => cb(a))
  })
}

export function getCombatantsTurns(battles: Battle[], combatant: Character) {
  return battles
    .filter(battle => {
      return battle.combatants.findIndex(c => c.id === combatant.id) >= 0
    })
    .map(battle => battle.turns)
    .reduce((a, b) => a.concat(b), [])
    .filter(turn => turn.character.id === combatant.id)
}

function getAllTotal(
  battles: Battle[],
  c: Character,
  field: FieldType
): BattleData[] {
  const totalObject = {
    text: c.name,
    value: 0,
  }
  const turnArray: BattleData[] = []
  const turns = getCombatantsTurns(battles, c)
  perAction(turns, a =>
    turnArray.push({ ...totalObject, value: a[field], target: a.target.name })
  )

  return turnArray
}

function getAllAverage(
  battles: Battle[],
  c: Character,
  field: FieldType
): BattleData {
  const text = c.name
  const value: number[] = []

  const turns = getCombatantsTurns(battles, c)
  perAction(turns, action => value.push(action[field]))

  return {
    text,
    value: getAverage(value),
  }
}

function getAllHigh(
  battles: Battle[],
  c: Character,
  field: FieldType
): BattleData {
  const text = c.name
  let value = 0

  const turns = getCombatantsTurns(battles, c)
  perAction(turns, action => {
    if (action[field] > value) {
      value = action[field]
    }
  })

  return {
    text,
    value,
  }
}

export default function({ battles, combatants, field }) {
  const total = computed<BattleData[][]>(() => {
    return combatants.value.map(c => {
      return getAllTotal(battles.value, c, field)
    })
  })

  const average = computed(() => {
    return combatants.value.map(c => {
      return getAllAverage(battles.value, c, field)
    })
  })

  const high = computed(() => {
    return combatants.value.map(c => {
      return getAllHigh(battles.value, c, field)
    })
  })

  return {
    total,
    average,
    high,
  }
}
