<template>
  <div class="radar-charts">
    <div>
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
      <v-select
        v-model="selectedCombatant"
        :items="combatants"
        item-text="name"
        item-value="id"
        return-object
        class="combatant-select"
        label="Select Combatant"
      ></v-select>
    </div>

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
  grid-template-rows: 64px 1fr 1fr;
  grid-template-columns: 100%;
  padding: 8px;
  @media (min-width: 800px) {
    grid-template-rows: 275px;
    grid-template-columns: 20% 40% 40%;
  }

  .combatant-list {
    display: none;
    @media (min-width: 800px) {
      display: block;
      max-height: 275px;
      overflow-y: scroll;
    }
  }

  .combatant-select {
    display: block;
    max-height: 275px;
    @media (min-width: 800px) {
      display: none;
    }
  }
}
</style>
