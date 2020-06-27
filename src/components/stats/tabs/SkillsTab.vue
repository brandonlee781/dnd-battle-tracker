<template>
  <div>
    <RollChart
      :selected.sync="filterSkill"
      :player.sync="filterPlayer"
      :chart-data="skillChartData.chartData"
      :options="skillChartData.options"
      :height="350"
      :horizontal="!!filterSkill"
    />
    <RollChart
      :selected.sync="filterSave"
      :player.sync="filterPlayer"
      :chart-data="saveChartData.chartData"
      :options="saveChartData.options"
      :height="350"
      :horizontal="!!filterSave"
    />
    <v-data-table :headers="headers" :items="rolls" dense>
      <template v-slot:top>
        <div class="filter-row">
          <v-text-field v-model="filterText" label="Filter" />
          <v-select
            v-model="filterPlayer"
            :items="party"
            return-object
            clearable
            item-text="name"
            label="Filter By Player"
          ></v-select>
          <v-select
            v-model="filterSkill"
            :items="skills"
            label="Filter By Skill"
            clearable
            @change="$nextTick(() => filterSave && (filterSave.value = null))"
          ></v-select>

          <v-select
            v-model="filterSave"
            :items="saves"
            label="Filter By Save"
            clearable
            @change="$nextTick(() => filterSkill && (filterSkill.value = null))"
          ></v-select>
        </div>
      </template>
      <template #item.date="{ item }">
        {{ (item.date.seconds * 1000) | date('MMM dd') }}
      </template>
      <template #item.player="{ item }">
        {{ party.find(p => p.id === item.player).name }}
      </template>
      <template #item.type="{ item }">{{ item.type | capitalize }}</template>
      <template #item.name="{ item }">
        {{ item.skill || item.save }}
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from '@vue/composition-api'
import useCollection from '@/use/useCollection'
import { useState } from '@/use/vuex-hooks'
import useRollData from '@/use/stats/rolls/useRollData'
import { AppState, RollData, PC } from '@/store'
import { DisplayType } from '@/use/stats/useBattleData'
import RollChart from '@/components/stats/charts/RollChart.vue'
import { DataTableHeader } from '@/use/stats/useBattleTableData'

export default defineComponent<{ display: DisplayType }>({
  name: 'SkillsCharts',
  components: {
    RollChart,
  },
  props: {
    display: {
      type: String,
      default: 'total',
    },
  },
  setup(props) {
    const filterText = ref('')
    const filterPlayer: Ref<PC | null> = ref(null)
    const filterSkill = ref(null)
    const filterSave = ref(null)
    const display = computed(() => props.display)
    const { party } = useState<AppState>({
      party: state => state.party,
    })
    const { collectionData } = useCollection<RollData>('rolls')

    const {
      skillChartData,
      saveChartData,
      skillData,
      saveData,
      skills,
      saves,
    } = useRollData({
      party: party.value,
      display,
      rolls: collectionData,
      selectedSkill: filterSkill,
      selectedSave: filterSave,
      selectedPlayer: filterPlayer,
    })

    const headers: DataTableHeader[] = [
      { text: 'Date', value: 'date' },
      { text: 'Player', value: 'player.name' },
      { text: 'Type', value: 'type' },
      {
        text: 'Name',
        value: 'name',
      },
      { text: 'Roll', value: 'roll' },
    ]

    const rolls = computed(() =>
      [...skillData?.value, ...saveData?.value]
        .filter(roll => {
          if (filterPlayer.value) {
            if (roll.player.id === filterPlayer.value.id) return true
            return false
          }
          return true
        })
        .filter(roll => {
          if (filterSkill.value) {
            if (roll.skill === filterSkill.value) return true
            return false
          }
          return true
        })
        .filter(roll => {
          if (filterSave.value) {
            if (roll.save === filterSave.value) return true
            return false
          }
          return true
        })
        .filter(roll => {
          if (!filterText.value) return true
          let next = false
          const filter = filterText.value
            .toLowerCase()
            .trim()
            .split(' ')

          const player = roll.player.name.toLowerCase()
          let name = ''
          if (roll.save) {
            name = roll.save.toLowerCase()
          } else if (roll.skill) {
            name = roll.skill.toLowerCase()
          }
          filter.forEach(f => {
            if (player.includes(f) || name.includes(f)) {
              next = true
            }
          })
          return next
        })
    )

    const onSkillClick = e => {
      const { tagName, innerHTML } = e.target
      if (tagName === 'tspan' && skills.includes(innerHTML)) {
        filterSkill.value = innerHTML
      }
    }

    return {
      party,
      filterPlayer,
      filterSkill,
      filterSave,
      filterText,
      skillChartData,
      saveChartData,
      headers,
      rolls,
      skills,
      saves,
      onSkillClick,
    }
  },
})
</script>

<style lang="scss" scoped>
.filter-row {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  padding: 0 8px;
  @media (min-width: 1264px) {
    grid-template-columns: 1fr 150px 150px 150px;
    grid-template-rows: 1fr;
  }
}

.skill-chart {
  max-height: 250px;
}
</style>
