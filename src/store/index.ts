import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from 'vuex-persistedstate'
import CharacterModule, { PC, NPC } from './CharacterModule'
import CombatModule, { CurrentBattle } from './CombatModule'

Vue.use(Vuex)

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

export interface RollCollection extends Omit<RollData, 'date'> {
  date: {
    nanoseconds: number
    seconds: number
  }
}

export interface AppState {
  characters?: CharacterModule
  combat?: CombatModule
  user: string | null
}

export default new Vuex.Store<AppState>({
  state: {
    user: null,
  },
  mutations: {
    SET_USER(state, { user }) {
      state.user = user
    },
  },
  modules: {
    characters: CharacterModule,
    combat: CombatModule,
  },
  plugins: [createPersistedState()],
})

export { PC, NPC, CurrentBattle }
