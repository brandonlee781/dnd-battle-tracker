<template>
  <div class="radar-charts">
    <v-list dense class="combatant-list">
      <v-list-item
        v-for="c in combatants"
        :key="c.id"
        :input-value="selectedCombatant && c.id === selectedCombatant.id"
        @click="selectCombatant(c)"
      >
        {{ c.name }}
      </v-list-item>
    </v-list>
    <template v-if="selectedCombatant">
      <RadarChart
        :options="fromData.options"
        :chart-data="fromData.chartData"
      />
      <RadarChart
        :options="againstData.options"
        :chart-data="againstData.chartData"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed } from '@vue/composition-api'
import { Character, Battle } from '@/store'
import useBattleData, { FieldType } from '@/use/stats/useBattleData'
import RadarChart from '@/components/stats/charts/RadarChart.vue'

interface RadarChartsProps {
  combatants: Character[]
  field: FieldType
  battles: Battle[]
  colors: string[]
}

export default defineComponent<RadarChartsProps>({
  name: 'RadarCharts',
  components: {
    RadarChart,
  },
  props: {
    combatants: {
      type: Array,
      default: () => [],
    },
    field: {
      type: String,
      default: 'damage',
    },
    battles: {
      type: Array,
      default: () => [],
    },
    colors: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const selectedCombatant: Ref<Character | null> = ref(null)
    const battles = computed(() => props.battles)
    const { againstData, fromData } = useBattleData({
      battles,
      field: props.field,
      selectedCombatant: selectedCombatant,
      colors: props.colors,
    })

    const selectCombatant = combatant => {
      selectedCombatant.value = combatant
    }
    return { selectedCombatant, selectCombatant, againstData, fromData }
  },
})
</script>

<style lang="scss" scoped>
.radar-charts {
  width: 100%;
  display: grid;
  grid-template-rows: 275px;
  grid-template-columns: 20% 40% 40%;
  padding: 8px;

  .combatant-list {
    max-height: 275px;
    overflow-y: scroll;
  }
}
</style>
