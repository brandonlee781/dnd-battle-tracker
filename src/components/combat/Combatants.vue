<template>
  <v-card>
    <v-card-title>Combatants</v-card-title>
    <v-card-text class="card-text">
      <v-list dense>
        <CombatantItem
          v-for="c in combatants"
          :key="c.id"
          :combatant="c"
          :active="active === c.id"
          :combatantId="c.id"
          @setInitiative="v => setInitiative({ id: c.id, initiative: +v })"
        />
      </v-list>
    </v-card-text>
    <NewNPCForm />
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useMutations, useGetters } from '@/use/vuex-hooks'
import NewNPCForm from './NewNpcForm.vue'
import CombatantItem from './CombatantItem.vue'

export default defineComponent({
  name: 'Combatants',
  components: {
    CombatantItem,
    NewNPCForm,
  },
  props: {
    active: {
      type: String,
      default: null,
    },
  },
  setup() {
    const { combatants } = useGetters({
      combatants: 'combatOrder',
    })
    const { setInitiative } = useMutations({
      setInitiative: 'SET_INITIATIVE',
    })

    return {
      combatants,
      setInitiative,
    }
  },
})
</script>

<style lang="scss" scoped>
.card-text {
  max-height: 320px;
  overflow-y: scroll;
}
</style>
