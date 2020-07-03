<template>
  <div class="wrapper">
    <v-card class="card">
      <div class="tab-row">
        <v-tabs v-model="tab">
          <v-tab v-for="item in tabItems" :key="item.value">{{
            item.text
          }}</v-tab>
          <v-spacer />
          <div class="display-select">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  outlined
                  color="primary"
                  dark
                  v-bind="attrs"
                  v-on="on"
                  class="ma-2"
                >
                  <span class="full-select">
                    {{ displayItems.find(i => i.value === displayType).text }}
                    <v-icon>mdi-menu-down</v-icon>
                  </span>
                  <v-icon class="filter-icon">mdi-filter-variant</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in displayItems"
                  :key="index"
                  @click="displayType = item.value"
                >
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <!-- <v-select
              v-model="displayType"
              :items="tab !== 2 ? displayItems : displayItems.slice(1, 3)"
              label="Data Display"
            ></v-select> -->
          </div>
        </v-tabs>
      </div>
      <v-tabs-items v-if="data && data.length" v-model="tab">
        <v-tab-item>
          <DamageTab :data="data" :display="displayType" />
        </v-tab-item>
        <v-tab-item>
          <HealingTab :data="data" :display="displayType" />
        </v-tab-item>
        <v-tab-item>
          <SkillsTab :display="displayType" />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from '@vue/composition-api'
import useCollection from '@/use/useCollection'
import { DisplayType } from '@/use/stats/useBattleData'
import { Battle } from '@/store'

import DamageTab from '@/components/stats/tabs/DamageTab.vue'
import HealingTab from '@/components/stats/tabs/HealingTab.vue'
import SkillsTab from '@/components/stats/tabs/SkillsTab.vue'

export default defineComponent({
  name: 'BattleStats',
  components: {
    DamageTab,
    HealingTab,
    SkillsTab,
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
    const displayItems = computed(() => {
      return [
        { text: tab.value === 2 ? 'Count' : 'Total', value: 'total' },
        { text: 'Average', value: 'average' },
        { text: 'Highest', value: 'high' },
      ]
    })
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
@media (min-width: 800px) {
  .wrapper {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    max-height: calc(100vh - 48px);
    overflow-y: scroll;
  }
  .card {
    width: 100%;
  }
}
.tab-row {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  padding-right: 4px;
}
.full-select {
  display: none;
}

@media (min-width: 800px) {
  .full-select {
    display: block;
  }
  .filter-icon {
    display: none;
  }
}
</style>
