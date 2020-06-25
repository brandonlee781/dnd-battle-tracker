<template>
  <v-card>
    <v-card-text>
      <v-list dense>
        <v-list-item v-for="roll in rolls" :key="roll.id">
          <span class="title">
            {{ roll.player.name }}
            rolled a {{ roll.roll }} on
            {{ roll.skill || roll.save | withArticle }}
            {{ roll.skill ? 'check' : 'save' }}.
          </span>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { useState } from '@/use/vuex-hooks'
import { AppState } from '@/store'
import useCollection from '@/use/useCollection'
import { RollData } from '@/store'

export default defineComponent({
  name: 'PartyRollLog',
  setup() {
    const { players } = useState<AppState>({
      players: state => state.party,
    })
    const { collectionData } = useCollection<RollData>('rolls')
    const rolls = computed(() => {
      return collectionData.value.map(roll => {
        const player = players.value.find(p => p.id === roll.player)
        return {
          ...roll,
          player,
        }
      })
    })
    return { rolls, players }
  },
})
</script>

<style lang="scss" scoped></style>
