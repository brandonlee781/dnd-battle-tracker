<template>
  <v-container fluid>
    <v-row>
      <v-col cols="3">
        <CombatCard @update:active="val => (activeCharacterId = val)" />
        <Combatants :active="activeCharacterId" />
      </v-col>
      <v-col cols="9">
        <CombatLog />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Combatants from '@/components/combat/Combatants.vue'
import CombatCard from '@/components/combat/CombatCard.vue'
import CombatLog from '@/components/combat/CombatLog.vue'

export default defineComponent({
  name: 'CombatPage',
  components: {
    CombatLog,
    Combatants,
    CombatCard,
  },
  setup() {
    const activeCharacterId = ref(null)
    return { activeCharacterId }
  },
})
</script>
