import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import cuid from 'cuid'
import { db } from '@/db'
import { Character } from './CharacterModule'

export interface BattleAction {
  target?: Character
  damage: number
  healing: number
  message: string
  downed: number | boolean
}
export interface BattleTurn {
  id: string
  round: number
  turn: number
  character: Character
  action: BattleAction[]
}
export interface Battle {
  id: string
  name: string
  combatants: Character[]
  turns: BattleTurn[]
  createdDate?: Date
}

export interface CurrentBattle extends Omit<Battle, 'id'> {
  currentRound: number
  currentTurn: number
}

@Module({ namespaced: false })
export default class CombatModule extends VuexModule {
  currentBattle: CurrentBattle = {
    name: '',
    combatants: [],
    turns: [],
    currentRound: 1,
    currentTurn: 1,
  }

  @Mutation
  SET_CURRENT_TURN({ value }) {
    debugger // eslint-disable-line
    const { currentBattle } = this
    if (value > currentBattle.combatants.length) {
      this.currentBattle.currentTurn = 1
      this.currentBattle.currentRound += 1
    } else if (value <= 0 && this.currentBattle.currentRound > 1) {
      this.currentBattle.currentTurn = currentBattle.combatants.length
      this.currentBattle.currentRound -= 1
    } else if (value > 0) {
      this.currentBattle.currentTurn = value
    }
  }

  @Mutation
  SET_BATTLE_NAME({ name }) {
    this.currentBattle.name = name
  }

  @Mutation
  SET_BATTLE_DATE() {
    this.currentBattle.createdDate = new Date()
  }

  @Mutation
  SET_BATTLE_COMBATANTS({ combatants }) {
    this.currentBattle.combatants = combatants
  }

  @Mutation
  ADD_BATTLE_TURN({ turn }) {
    this.currentBattle.turns.push(turn)
  }

  @Mutation
  MODIFY_BATTLE_TURN({ turn, index }) {
    this.currentBattle.turns[index] = turn
  }

  @Mutation
  RESET_CURRENT_BATTLE() {
    this.currentBattle = {
      name: '',
      combatants: [],
      turns: [],
      currentRound: 1,
      currentTurn: 1,
    }
  }

  @Action
  startCombat({ state, commit }) {
    commit('SET_BATTLE_COMBATANTS', {
      combatants: [...state.party, ...state.npcs],
    })
    commit('SET_BATTLE_DATE')
  }

  @Action
  endCombat({ state, commit }) {
    const { party, npcs } = state
    const battle = {
      ...this.currentBattle,
      id: cuid(),
    }
    db.collection('battles')
      .doc(battle.id)
      .set(battle)
    party.forEach(p => {
      commit('SET_PARTY_INITIATIVE', { id: p.id, initiative: 0 })
    })
    npcs.forEach(n => {
      commit('REMOVE_NPC', { id: n.id })
    })
    commit('SET_BATTLE_COMBATANTS', {
      combatants: [],
    })
    commit('RESET_CURRENT_BATTLE')
  }

  @Action
  endTurn({ commit }, { turn, round, action, character }) {
    const battleTurn: BattleTurn = {
      id: cuid(),
      turn,
      round,
      action: action.map(a => {
        if (a.damage > 0) {
          a.message = this.getDamageMessage(a, character)
        }

        if (a.healing > 0) {
          a.message = `${character.name} healed ${a.target.name} for ${a.healing} hp.`
        }

        if (a.damage === 0 && a.healing === 0) {
          a.message = `${character.name} did nothing worth noting.`
        }
        return a
      }),
      character,
    }

    const turnIndex = this.currentBattle.turns.findIndex(
      turn => turn.round === battleTurn.round && turn.turn === battleTurn.turn
    )

    if (turnIndex >= 0) {
      commit('MODIFY_BATTLE_TURN', { turn: battleTurn, index: turnIndex })
    } else {
      commit('ADD_BATTLE_TURN', { turn: battleTurn })
    }
  }

  @Action
  async deleteBattle(ctx, { id }) {
    db.collection('battles')
      .doc(id)
      .delete()
  }

  private getDamageMessage(action, character) {
    const { downed, target, damage } = action
    let message = `${character.name} damaged ${target.name} for ${damage} hp`
    if (downed) {
      if (typeof downed === 'number' && target.count) {
        if (downed === target.count) {
          message += `, downing all of them.`
        } else {
          const killCount = 0
          // downed +
          // this.currentBattle.actions
          //   .filter(a => a.target.id === target.id)
          //   .reduce((a, b) => {
          //     if (typeof b.downed === 'number') {
          //       return a + b.downed
          //     } else {
          //       return a
          //     }
          //   }, 0)
          if (killCount >= target.count) {
            message += `, downing the last ${downed} of them.`
          } else {
            message += `, downing ${downed} of them.`
          }
        }
      } else if (typeof downed === 'boolean') {
        message += ', downing them.'
      }
    }
    return message
  }
}
