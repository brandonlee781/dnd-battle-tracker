<template>
  <v-card>
    <div class="tab-row">
      <v-tabs
        v-model="tab"
        @change="tab === 2 ? (displayType = 'average') : null"
      >
        <v-tab v-for="item in tabItems" :key="item.value">{{
          item.text
        }}</v-tab>
        <v-spacer />
        <div class="display-select">
          <v-select
            v-model="displayType"
            :items="tab !== 2 ? displayItems : displayItems.slice(1, 3)"
            label="Data Display"
          ></v-select>
        </div>
      </v-tabs>
    </div>
    <v-tabs-items v-if="data && data.length" v-model="tab">
      <v-tab-item>
        <DamageCharts :data="data" :display="displayType" />
      </v-tab-item>
      <v-tab-item>
        <HealingCharts :data="data" :display="displayType" />
      </v-tab-item>
      <v-tab-item>
        <SkillsCharts :display="displayType" />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from '@vue/composition-api'
import useCollection from '@/use/useCollection'
import { DisplayType } from '@/use/stats/useBattleData'
import { Battle } from '@/store'

import DamageCharts from '@/components/stats/charts/DamageCharts.vue'
import HealingCharts from '@/components/stats/charts/HealingCharts.vue'
import SkillsCharts from '@/components/stats/charts/SkillsCharts.vue'

export default defineComponent({
  name: 'BattleStats',
  components: {
    DamageCharts,
    HealingCharts,
    SkillsCharts,
  },
  props: {
    battle: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const tab = ref(0)
    const tabItems = ref([
      { value: 'damage-all', text: 'Damage' },
      { value: 'healing-all', text: 'Healing' },
      { value: 'rolls', text: 'Rolls' },
    ])
    const displayType: Ref<DisplayType> = ref('total')
    const displayItems = [
      { text: 'Total', value: 'total' },
      { text: 'Average', value: 'average' },
      { text: 'Highest', value: 'high' },
    ]
    const { collectionData: battles } = useCollection<Battle>('battles', {
      onMounted: true,
    })
    const data = computed(() => {
      if (props.battle === 'all') {
        return battles.value
      }
      return battles.value.filter(b => b.id === props.battle)
    })

    return { tab, tabItems, data, displayType, displayItems }
  },
})
</script>

<style lang="scss" scoped>
.tab-row {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  padding-right: 4px;
}
</style>
