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
      <apexchart height="100%" width="100%" type="radar" v-bind="againstData" />
      <apexchart height="100%" width="100%" type="radar" v-bind="fromData" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed } from '@vue/composition-api'
import { Character, Battle } from '@/store'
import useBattleData, { FieldType } from '@/use/stats/useBattleData'

interface RadarChartsProps {
  combatants: Character[]
  field: FieldType
  battles: Battle[]
}

export default defineComponent<RadarChartsProps>({
  name: 'RadarCharts',
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
  },
  setup(props) {
    const selectedCombatant: Ref<Character | null> = ref(null)
    const battles = computed(() => props.battles)
    const { pointsAgainstData, pointsFromData } = useBattleData({
      battles,
      field: props.field,
    })
    const fieldLabel =
      props.field.charAt(0).toUpperCase() + props.field.slice(1)

    const againstData = computed(() => {
      const options = pointsAgainstData.options.value
      return {
        options: {
          ...options,
          title: {
            text: `${fieldLabel} Against Targets`,
            align: 'center',
          },
        },
        series: pointsAgainstData.series.value.filter(
          s => s.id == selectedCombatant.value?.id
        ),
      }
    })
    const fromData = computed(() => {
      const options = pointsFromData.options.value
      return {
        options: {
          ...options,
          title: {
            text: `${fieldLabel} From Targets`,
            align: 'center',
          },
        },
        series: pointsFromData.series.value.filter(
          s => s.id == selectedCombatant.value?.id
        ),
      }
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
