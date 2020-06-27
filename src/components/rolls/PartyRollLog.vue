<template>
  <v-card>
    <v-card-text>
      <v-list dense>
        <v-list-item v-for="roll in rolls" :key="roll.id">
          <span class="title">
            {{ roll.date }}:
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
import { AppState, RollCollection } from '@/store'
import useCollection from '@/use/useCollection'
import { format } from 'date-fns'

export default defineComponent({
  name: 'PartyRollLog',
  setup() {
    const { players } = useState<AppState>({
      players: state => state.party,
    })
    const { collectionData } = useCollection<RollCollection>('rolls', {
      orderBy: { field: 'date', direction: 'desc' },
    })
    const rolls = computed(() => {
      return collectionData.value.map(roll => {
        const player = players.value.find(p => p.id === roll.player)
        return {
          ...roll,
          player,
          date: format(new Date(roll.date.seconds * 1000), 'MMM dd hh:mm'),
        }
      })
    })
    return { rolls, players }
  },
})
</script>

<style lang="scss" scoped></style>
