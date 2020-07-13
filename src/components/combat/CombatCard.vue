<template>
  <v-card class="mb-3">
    <v-card-title v-if="!currentBattle.combatants.length">
      <v-text-field
        v-model="battleName"
        label="Enter Battle Name"
        hide-details
      />
      <v-spacer></v-spacer>
      <v-btn color="green" @click="onCombatStart">
        Start Combat
      </v-btn>
    </v-card-title>
    <v-card-title v-else>
      {{ activeCharacter.name }}'s turn
      <v-spacer></v-spacer>
      <v-btn color="red" @click="onCombatEnd">
        End Combat
      </v-btn>
    </v-card-title>

    <template v-if="currentBattle.combatants.length">
      <v-card-text>
        <v-select
          v-model="targets"
          :items="combatOrder"
          item-value="id"
          item-text="name"
          return-object
          multiple
          label="Target"
        ></v-select>

        <template v-for="(action, index) in actions">
          <div class="action-row" :key="index">
            <span class="name subtitle-1">
              {{ action.target.name }}
            </span>
            <v-text-field
              v-model.number="action.damage"
              type="number"
              label="Damage"
              class="damage-field"
              prepend-icon="mdi-fire"
            />
            <v-text-field
              v-model.number="action.healing"
              type="number"
              label="Healing"
              class="healing-field"
              prepend-icon="mdi-medical-bag"
            />
            <template v-if="action.damage > 0">
              <v-switch
                v-if="action.target && !action.target.count"
                v-model="action.downed"
                label="Downed?"
              />
              <v-text-field
                v-if="action.target && action.target.count"
                v-model.number="action.downed"
                type="number"
                label="Number Downed"
              />
            </template>
          </div>
        </template>
      </v-card-text>

      <v-card-actions class="mx-2 mb-5">
        <v-btn text color="grey" @click="currentTurn -= 1">
          Previous Turn
        </v-btn>
        <v-spacer />
        <v-btn color="blue" @click="onTurnEnd">
          Next Turn
        </v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  WritableComputedRef,
  Ref,
} from '@vue/composition-api'
import {
  useState,
  useGetters,
  useActions,
  useMutations,
} from '@/use/vuex-hooks'
import { AppState, NPC } from '@/store'

export function useTurnCount(): {
  currentRound: Ref<number>
  currentTurn: WritableComputedRef<number>
} {
  const { turn, currentRound } = useState<AppState>({
    turn: state => state.combat.currentBattle.currentTurn,
    currentRound: state => state.combat.currentBattle.currentRound,
  })
  const { setTurn } = useMutations({
    setTurn: 'SET_CURRENT_TURN',
  })
  const currentTurn: WritableComputedRef<number> = computed({
    get() {
      return turn.value
    },
    set(value) {
      setTurn({ value })
    },
  })
  return {
    currentTurn,
    currentRound,
  }
}

export const useCombatState = () => {
  const state = useState<AppState>({
    currentBattle: state => state.currentBattle,
  })
  const getters = useGetters(['combatOrder'])
  const actions = useActions(['startCombat', 'endCombat', 'endTurn'])
  const methods = useMutations({
    setBattleName: 'SET_BATTLE_NAME',
  })

  return {
    state,
    getters,
    actions,
    methods,
  }
}

export const useActionData = () => {
  const damage = ref(0)
  const healing = ref(0)
  const downed = ref(null)
  const targets: Ref<NPC[] | null> = ref(null)

  const reset = () => {
    damage.value = 0
    healing.value = 0
    targets.value = null
    downed.value = null
  }

  return {
    damage,
    healing,
    downed,
    targets,
    reset,
  }
}

export default defineComponent({
  name: 'CombatCard',
  setup(props, { emit }) {
    const battleName = ref('')
    const targets: Ref<NPC[] | null> = ref(null)
    const actions = computed(() => {
      if (targets.value) {
        return targets.value.map(t => ({
          target: t,
          damage: 0,
          healing: 0,
          downed: null,
        }))
      }
      return []
    })
    const {
      state: { currentBattle },
      getters: { combatOrder },
      methods: { setBattleName },
      actions: { startCombat, endCombat, endTurn },
    } = useCombatState()
    const { currentTurn, currentRound } = useTurnCount()
    const activeCharacter = computed(() => {
      const character = combatOrder.value[currentTurn.value - 1]
      emit('update:active', character.id)
      return character
    })

    const onCombatEnd = () => {
      emit('update:active', null)
      currentTurn.value = 1
      currentRound.value = 1
      endCombat()
    }
    const onCombatStart = () => {
      if (battleName.value.length) {
        setBattleName({ name: battleName.value })
        battleName.value = ''
        startCombat()
      }
    }

    const onTurnEnd = () => {
      endTurn({
        turn: currentTurn.value,
        round: currentRound.value,
        character: activeCharacter.value,
        action: actions.value,
      })
      targets.value = []
      currentTurn.value += 1
    }

    return {
      currentTurn,
      combatOrder,
      currentBattle,
      battleName,
      onTurnEnd,
      activeCharacter,
      onCombatStart,
      onCombatEnd,

      targets,
      actions,
    }
  },
})
</script>

<style lang="scss" scoped>
.action-row {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 115px 115px min-content;
  gap: 8px;
  align-items: center;
}
</style>
