import Vue from 'vue'
import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

export interface PC {
  id: string
  name: string
  initiative: number
  downed: boolean
  count?: null
}
export interface NPC extends Omit<PC, 'count'> {
  count?: number
}
export type Character = NPC | PC

@Module
export default class CharacterModule extends VuexModule {
  party: PC[] = [
    { id: '1', name: 'Chandra', initiative: 0, downed: false },
    { id: '2', name: 'Demi', initiative: 0, downed: false },
    { id: '3', name: 'Elryn', initiative: 0, downed: false },
    { id: '4', name: 'Kal', initiative: 0, downed: false },
    { id: '5', name: 'Val', initiative: 0, downed: false },
  ]
  npcs: NPC[] = []

  @Mutation
  SET_INITIATIVE({ id, initiative }: Character): void {
    const partyIndex = this.party.findIndex(p => p.id === id)
    if (partyIndex >= 0) {
      this.party[partyIndex].initiative = initiative
    } else {
      const npcIndex = this.npcs.findIndex(p => p.id === id)
      if (npcIndex >= 0) {
        this.npcs[npcIndex].initiative = initiative
      }
    }
  }

  @Mutation
  TOGGLE_DOWNED_STATE({ id }) {
    const partyIndex = this.party.findIndex(p => p.id === id)
    if (partyIndex >= 0) {
      this.party[partyIndex].downed = !this.party[partyIndex].downed
    } else {
      const npcIndex = this.npcs.findIndex(p => p.id === id)
      if (npcIndex >= 0) {
        this.npcs[npcIndex].downed = !this.npcs[npcIndex].downed
      }
    }
  }

  @Mutation
  ADD_NPC({ name, count, initiative, id }) {
    const newNpc = {
      id,
      name,
      count: +count,
      initiative: +initiative,
      downed: false,
    }
    this.npcs.push(newNpc)
  }

  @Mutation
  EDIT_NPC({ data, id }: { data: Partial<NPC>; id: string }) {
    const npcIndex = this.npcs.findIndex(n => n.id === id)
    if (npcIndex >= 0) {
      const editedNpc = {
        ...this.npcs[npcIndex],
        ...data,
      }
      Vue.set(this.npcs, npcIndex, editedNpc)
    }
  }

  @Mutation
  REMOVE_NPC({ id }) {
    const index = this.npcs.findIndex(n => n.id === id)
    if (index >= 0) {
      this.npcs.splice(index, 1)
    }
  }

  get combatOrder() {
    return [...this.party, ...this.npcs].sort((a, b) => {
      if (a.initiative > b.initiative) return -1
      if (a.initiative < b.initiative) return 1
      return 0
    })
  }
}
