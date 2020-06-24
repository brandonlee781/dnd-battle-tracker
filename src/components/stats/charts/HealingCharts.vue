<template>
  <div>
    <apexchart height="250" type="bar" v-bind="barChartData" />
    <apexchart
      v-if="data.length === 1"
      height="250"
      type="bar"
      v-bind="roundData"
    />
    <v-divider />
    <v-divider></v-divider>
    <RadarCharts :battles="data" :combatants="combatants" field="healing" />
    <ActionTable v-bind="tableData" :page-length="combatants.length" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import useBattleData, { DisplayType } from '@/use/stats/useBattleData'
import useBattleTableData from '@/use/stats/useBattleTableData'
import RadarCharts from '@/components/stats/charts/RadarCharts.vue'
import ActionTable from '@/components/stats/ActionTable.vue'
import { Battle } from '@/store'

export default defineComponent<{ data: Battle[]; display: DisplayType }>({
  name: 'HealingCharts',
  components: {
    RadarCharts,
    ActionTable,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    display: {
      type: String,
      default: 'total',
    },
  },
  setup(props) {
    const display = computed(() => props.display)
    const showItems = [
      { text: 'Total Healing', value: 'total' },
      { text: 'Average Healing', value: 'average' },
      { text: 'Highest Healing', value: 'high' },
    ]
    const battles = computed(() => props.data)
    const { combatants, barChartData, roundData } = useBattleData({
      battles,
      field: 'healing',
      display,
    })

    const tableData = useBattleTableData(battles, 'healing')

    return {
      showItems,
      combatants,
      barChartData,
      roundData,
      tableData,
    }
  },
})
</script>

<style lang="scss" scoped></style>
