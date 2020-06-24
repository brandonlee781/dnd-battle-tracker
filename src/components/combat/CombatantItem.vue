<template>
  <v-list-item :input-value="active" color="green">
    <v-list-item-content class="py-1 content">
      <div class="item-title">
        {{ name }} {{ count ? ` x${count} ` : null }}
      </div>
      <v-text-field
        :value="initiative"
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
            @click="toggleDownedState({ id })"
          >
            <v-icon :color="downed ? 'red' : '#37474F'">mdi-skull</v-icon>
          </v-btn>
        </template>
        <span>{{ name }} is {{ !downed ? 'not' : null }} Downed</span>
      </v-tooltip>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useMutations } from '@/use/vuex-hooks'

export default defineComponent({
  name: 'CombatantItem',
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: null,
    },
    initiative: {
      type: Number,
      default: 0,
    },
    downed: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { toggleDownedState } = useMutations({
      toggleDownedState: 'TOGGLE_DOWNED_STATE',
    })
    return { toggleDownedState }
  },
})
</script>

<style lang="scss" scoped>
.content {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 75px 64px;
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
