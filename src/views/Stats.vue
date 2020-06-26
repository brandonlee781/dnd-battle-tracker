<template>
  <v-container fluid>
    <v-row>
      <v-col xl="3" lg="4" md="6" cols="12">
        <BattleList v-model="selection" />
      </v-col>
      <v-col xl="9" lg="8" md="6" cols="12">
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
