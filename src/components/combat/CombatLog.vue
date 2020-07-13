<template>
  <div class="wrapper">
    <v-card v-if="currentBattle.name.length" class="current-battle-card mb-4">
      <v-card-title>{{ currentBattle.name }}</v-card-title>
      <v-card-text>
        <BattleDetail :battle="currentBattle" reversed />
      </v-card-text>
    </v-card>

    <span v-if="error">{{ error }}</span>
    <v-card v-if="!error && pastBattles" class="past-battles">
      <template v-for="battle in pastBattles">
        <v-card-title :key="`${battle.id}-title`" class="battle-title">
          {{ battle.name }}
          <v-spacer />
          <v-btn icon class="delete-btn" @click="onBattleDelete(battle.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text :key="`${battle.id}-text`">
          <BattleDetail :battle="battle" />
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useState, useActions } from '@/use/vuex-hooks'
import { AppState } from '@/store'
import { Battle } from '@/store/CombatModule'
import BattleDetail from './BattleDetail.vue'
import useCollection from '@/use/useCollection'

export default defineComponent({
  name: 'CombatLog',
  components: {
    BattleDetail,
  },
  setup() {
    const { currentBattle } = useState<AppState>({
      currentBattle: state => state.combat.currentBattle,
    })
    const { error, collectionData: pastBattles } = useCollection<Battle>(
      'battles',
      {
        onMounted: true,
        orderBy: { field: 'createdDate' },
      }
    )

    const { deleteBattle } = useActions(['deleteBattle'])
    const onBattleDelete = id => {
      if (confirm('Are you sure you want to delete this battle?')) {
        deleteBattle({ id })
      }
    }

    return {
      currentBattle,
      pastBattles,
      onBattleDelete,
      error,
    }
  },
})
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  max-height: calc(100vh - 48px);
  overflow-y: scroll;
}

.current-battle-card,
.past-battles {
  width: 100%;
}

.delete-btn {
  display: none;
}

.battle-title {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.battle-title:hover {
  & > .delete-btn {
    display: inline-flex;
  }
}
</style>
