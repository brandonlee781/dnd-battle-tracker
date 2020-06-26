<template>
  <v-container fluid>
    <v-row>
      <v-col xl="3" lg="4" md="6" sm="12">
        <CombatCard @update:active="val => (activeCharacterId = val)" />
        <Combatants :active="activeCharacterId" />
      </v-col>
      <v-col xl="9" lg="8" md="6" sm="12">
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
