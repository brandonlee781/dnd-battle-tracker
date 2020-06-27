<template>
  <v-list-item :input-value="active" color="green" class="px-0">
    <v-list-item-content class="py-1 content">
      <div v-if="!editing" class="item-title">
        {{ combatant.name }}
        {{ combatant.count ? ` x${combatant.count} ` : null }}
      </div>
      <div v-else>
        <v-text-field v-model="editedName" hide-details label="Name" />
        <v-text-field v-model="editedCount" hide-details label="Count" />
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
          <v-list-item v-if="!editing">
            <v-btn text block @click="onEdit(combatant.id)">
              Edit NPC
            </v-btn>
          </v-list-item>
          <v-list-item v-if="editing">
            <v-btn text color="success" block @click="onSave">
              Save NPC
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn text block color="red" @click="onDelete">
              Delete NPC
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import { useMutations, useState } from '@/use/vuex-hooks'
import { Character, AppState } from '../../store'

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
    const { npcs } = useState<AppState>({
      npcs: state => state.npcs,
    })
    const { toggleDownedState, removeNpc, editNpc } = useMutations({
      toggleDownedState: 'TOGGLE_DOWNED_STATE',
      removeNpc: 'REMOVE_NPC',
      editNpc: 'EDIT_NPC',
    })

    const editing = ref(null)
    const editedName = computed({
      get() {
        return npcs.value.find(n => n.id === editing.value).name
      },
      set(val) {
        editNpc({ id: editing.value, data: { name: val } })
      },
    })
    const editedCount = computed({
      get() {
        return npcs.value.find(n => n.id === editing.value).count
      },
      set(val) {
        editNpc({ id: editing.value, data: { count: val || 0 } })
      },
    })

    const onDelete = () => {
      removeNpc({ id: props.combatantId })
    }
    const onEdit = id => {
      editing.value = id
    }
    const onSave = () => {
      editing.value = null
    }

    return {
      editing,
      editedName,
      editedCount,
      toggleDownedState,
      removeNpc,
      onDelete,
      onEdit,
      onSave,
    }
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
