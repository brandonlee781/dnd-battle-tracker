<template>
  <v-list-item :input-value="active" color="green">
    <v-list-item-content class="py-1 content">
      <div class="item-title">
        {{ combatant.name }}
        {{ combatant.count ? ` x${combatant.count} ` : null }}
      </div>
      <v-text-field
        :value="combatant.initiative"
        type="number"
        hide-details
        label="Initiative"
        class="initiative"
        @blur="e => $emit('setInitiative', +e.target.value)"
        @keypress.enter="e => $emit('setInitiative', +e.target.value)"
      />
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            class="downed-button"
            icon
            @click="toggleDownedState({ id: combatant.id })"
          >
            <v-icon :color="combatant.downed ? 'red' : '#37474F'">
              mdi-skull
            </v-icon>
          </v-btn>
        </template>
        <span>
          {{ combatant.name }} is {{ !combatant.downed ? 'not' : null }} Downed
        </span>
      </v-tooltip>

      <v-menu v-if="combatant.id.length > 1">
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-btn text color="red" @click="onDelete">
              Delete NPC
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useMutations } from '@/use/vuex-hooks'
import { Character } from '../../store'

interface CombatantItemProps {
  combatant: Character
  active: boolean
  combatantId: string
}

export default defineComponent<CombatantItemProps>({
  name: 'CombatantItem',
  props: {
    combatant: {
      type: Object,
      default: () => ({}),
    },
    active: {
      type: Boolean,
      default: false,
    },
    combatantId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { toggleDownedState, removeNpc } = useMutations({
      toggleDownedState: 'TOGGLE_DOWNED_STATE',
      removeNpc: 'REMOVE_NPC',
    })

    const onDelete = () => {
      removeNpc({ id: props.combatantId })
    }

    return { toggleDownedState, removeNpc, onDelete }
  },
})
</script>

<style lang="scss" scoped>
.content {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 75px 64px 32px;
  gap: 8px;
  grid-template-areas: 'title init downed';
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  .item-title {
    grid-area: title;
    align-self: center;
    padding-left: 8px;
  }

  .initiative {
    grid-area: init;
  }

  .downed-button {
    grid-area: downed;
    justify-self: center;
  }
}
</style>
