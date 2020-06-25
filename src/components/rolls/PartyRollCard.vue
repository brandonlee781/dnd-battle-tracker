<template>
  <v-card>
    <v-list dense>
      <PlayerRollListItem
        v-for="player in players"
        :key="player.id"
        :player="player"
      />
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useState } from '@/use/vuex-hooks'
import { AppState } from '@/store'
import PlayerRollListItem from '@/components/rolls/PartyRollListItem.vue'

export default defineComponent({
  name: 'PartyRollCard',
  components: {
    PlayerRollListItem,
  },
  setup() {
    const { players } = useState<AppState>({
      players: state => state.party,
    })

    return { players }
  },
})
</script>

<style lang="scss" scoped></style>
