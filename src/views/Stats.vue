<template>
  <v-container fluid>
    <v-row>
      <v-col cols="3">
        <BattleList v-model="selection" />
      </v-col>
      <v-col cols="9">
        <BattleStats :battle="selection" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import BattleList from '@/components/stats/BattleList.vue'
import BattleStats from '@/components/stats/BattleStats.vue'

export default defineComponent({
  name: 'StatsPage',
  components: {
    BattleList,
    BattleStats,
  },
  setup() {
    const selection = ref('all')
    return { selection }
  },
})
</script>

<style lang="scss" scoped></style>
