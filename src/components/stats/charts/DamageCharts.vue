<template>
  <div>
    <BarChart
      :options="barChartData.options"
      :chartData="barChartData.chartData"
      :height="350"
    />

    <BarChart
      v-if="data.length === 1"
      :options="roundData.options"
      :chartData="roundData.chartData"
      :height="350"
    />

    <v-divider />
    <RadarCharts
      :battles="data"
      :combatants="combatants"
      field="damage"
      :colors="colors"
    />
    <ActionTable
      v-bind="tableData"
      :page-length="data.length ? combatants.length : 5"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import useBattleData, { DisplayType } from '@/use/stats/useBattleData'
import { Battle } from '@/store'
import RadarCharts from '@/components/stats/charts/RadarCharts.vue'
import ActionTable from '@/components/stats/ActionTable.vue'
import useBattleTableData from '@/use/stats/useBattleTableData'
import BarChart from '@/components/stats/charts/BarChart.vue'

export default defineComponent<{ data: Battle[]; display: DisplayType }>({
  name: 'DamageCharts',
  components: {
    BarChart,
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
    const battles = computed(() => props.data)
    const display = computed(() => props.display)
    const { combatants, barChartData, roundData, colors } = useBattleData({
      battles,
      field: 'damage',
      display,
    })

    const tableData = useBattleTableData(battles, 'damage')

    return {
      combatants,
      barChartData,
      roundData,
      tableData,
      colors,
    }
  },
})
</script>

<style lang="scss" scoped></style>
