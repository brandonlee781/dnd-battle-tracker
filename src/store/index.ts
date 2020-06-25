import Vue from 'vue'
import Vuex from 'vuex'
import cuid from 'cuid'
import { db } from '@/db'

Vue.use(Vuex)

export interface PC {
  id: string
  name: string
  initiative: number
  downed: boolean
}
export interface NPC extends PC {
  count?: number
}
export type Character = NPC | PC

export interface BattleAction {
  target: Character
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

export type RollType = 'save' | 'skill'
export interface RollData {
  id: string
  player: string
  roll: number
  type: RollType
  save?: string
  skill?: string
  date: Date
}

export interface AppState {
  party: PC[]
  npcs: NPC[]
  currentBattle: Omit<Battle, 'id'>
  user: firebase.auth.UserCredential['user'] | null
}

function getDamageMessage(action, character, state, commit) {
  const { downed, target, damage } = action
  let message = `${character.name} damaged ${target.name} for ${damage} hp`
  if (downed) {
    if (typeof downed === 'number' && target.count) {
      if (downed === target.count) {
        commit('TOGGLE_DOWNED_STATE', { id: target.id })
        message += `, downing all of them.`
      } else {
        const killCount =
          downed +
          state.currentBattle.actions
            .filter(a => a.target.id === target.id)
            .reduce((a, b) => {
              if (typeof b.downed === 'number') {
                return a + b.downed
              } else {
                return a
              }
            }, 0)
        if (killCount >= target.count) {
          commit('TOGGLE_DOWNED_STATE', { id: target.id })
          message += `, downing the last ${downed} of them.`
        } else {
          message += `, downing ${downed} of them.`
        }
      }
    } else if (typeof downed === 'boolean') {
      commit('TOGGLE_DOWNED_STATE', { id: target.id })
      message += ', downing them.'
    }
  }

  return message
}

export default new Vuex.Store<AppState>({
  state: {
    party: [
      { id: '1', name: 'Chandra', initiative: 0, downed: false },
      { id: '2', name: 'Demi', initiative: 0, downed: false },
      { id: '3', name: 'Elryn', initiative: 0, downed: false },
      { id: '4', name: 'Kal', initiative: 0, downed: false },
      { id: '5', name: 'Val', initiative: 0, downed: false },
    ],
    npcs: [],
    currentBattle: {
      name: '',
      combatants: [],
      turns: [],
    },
    user: null,
  },
  getters: {
    combatOrder(state) {
      return [...state.party, ...state.npcs].sort((a, b) => {
        if (a.initiative > b.initiative) return -1
        if (a.initiative < b.initiative) return 1
        return 0
      })
    },
  },
  mutations: {
    SET_USER(state, { user }) {
      state.user = user
    },
    SET_INITIATIVE(state, { id, initiative }) {
      const partyIndex = state.party.findIndex(p => p.id === id)
      if (partyIndex >= 0) {
        state.party[partyIndex].initiative = initiative
      } else {
        const npcIndex = state.npcs.findIndex(p => p.id === id)
        if (npcIndex >= 0) {
          state.npcs[npcIndex].initiative = initiative
        }
      }
    },
    TOGGLE_DOWNED_STATE(state, { id }) {
      const partyIndex = state.party.findIndex(p => p.id === id)
      if (partyIndex >= 0) {
        state.party[partyIndex].downed = !state.party[partyIndex].downed
      } else {
        const npcIndex = state.npcs.findIndex(p => p.id === id)
        if (npcIndex >= 0) {
          state.npcs[npcIndex].downed = !state.npcs[npcIndex].downed
        }
      }
    },
    ADD_NPC(state, { name, count, initiative, id }) {
      const newNpc = {
        id,
        name,
        count: +count,
        initiative: +initiative,
        downed: false,
      }
      state.npcs.push(newNpc)
    },
    REMOVE_NPC(state, { id }) {
      const index = state.npcs.findIndex(n => n.id === id)
      if (index >= 0) {
        state.npcs.splice(index, 1)
      }
    },
    SET_BATTLE_NAME(state, { name }) {
      state.currentBattle.name = name
    },
    SET_BATTLE_DATE(state) {
      state.currentBattle.createdDate = new Date()
    },
    SET_BATTLE_COMBATANTS(state, { combatants }) {
      state.currentBattle.combatants = combatants
    },
    ADD_BATTLE_TURN(state, { turn }) {
      state.currentBattle.turns.push(turn)
    },
    RESET_CURRENT_BATTLE(state) {
      state.currentBattle = {
        name: '',
        combatants: [],
        turns: [],
      }
    },
  },
  actions: {
    startCombat({ state, commit }) {
      commit('SET_BATTLE_COMBATANTS', {
        combatants: [...state.party, ...state.npcs],
      })
      commit('SET_BATTLE_DATE')
    },
    endCombat({ state, commit }) {
      const { party, npcs } = state
      const battle = {
        ...state.currentBattle,
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
    },
    endTurn({ state, commit }, { turn, round, action, character }) {
      const battleTurn: BattleTurn = {
        id: cuid(),
        turn,
        round,
        action: action.map(a => {
          if (a.damage > 0) {
            a.message = getDamageMessage(a, character, state, commit)
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

      commit('ADD_BATTLE_TURN', { turn: battleTurn })
    },
    async deleteBattle(ctx, { id }) {
      db.collection('battles')
        .doc(id)
        .delete()
    },
  },
  modules: {},
})
