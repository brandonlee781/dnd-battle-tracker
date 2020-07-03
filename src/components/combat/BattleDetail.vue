<template>
  <v-list dense>
    <template v-for="(turn, turnIndex) in battleTurns">
      <v-subheader
        v-if="turn.action.length"
        :key="`header-${battle.name}-${turn.round}-${turn.turn}`"
        @click="toggleTurn(turnIndex)"
      >
        {{ turn.character.name }} - Round: {{ turn.round }} Turn:
        {{ turn.turn }}
      </v-subheader>
      <v-list-item
        v-if="showTurns[turnIndex].show && turn.action.length"
        :key="`item-${battle.name}-${turn.round}-${turn.turn}`"
      >
        <v-list-item-content class="pl-5">
          <div
            v-for="(action, index) in turn.action"
            :key="`${turn.character.name}-${turn.round}-${turn.turn}-${index}`"
            :class="{
              'text-h6': true,
              'green--text text--darken-1': action.healing,
              'red--text text--darken-3': action.damage,
            }"
          >
            {{ action.message }}
          </div>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, Ref, computed } from '@vue/composition-api'

export default defineComponent({
  name: 'BattleDetail',
  props: {
    battle: {
      type: Object,
      default: null,
    },
    reversed: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const showTurns: Ref<{ show: boolean }[]> = computed(() =>
      props.battle.turns.map(() => ({ show: true }))
    )

    const toggleTurn = (index: number) => {
      showTurns.value[index].show = !showTurns.value[index].show ?? true
    }

    const battleTurns = computed(() => {
      if (props.reversed) return props.battle.turns.reverse()
      return props.battle.turns
    })
    return { showTurns, toggleTurn, battleTurns }
  },
})
</script>

<style lang="scss" scoped></style>
