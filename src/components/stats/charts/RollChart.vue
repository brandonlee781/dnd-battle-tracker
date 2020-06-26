<template>
  <div class="wrapper">
    <v-btn
      v-if="selected"
      text
      small
      class="back-button"
      @click="$emit('update:selected', null)"
    >
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
    <BarChart
      v-if="!horizontal"
      :chart-data="chartData"
      :options="options"
      :height="height"
      @click:x-axis="onLabelClick"
    />
    <HorizontalBarChart
      v-if="horizontal"
      :chart-data="chartData"
      :options="options"
      :height="height"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import BarChart from './BarChart.vue'
import HorizontalBarChart from './HorizontalBarChart.vue'

export default defineComponent({
  name: 'RollChart',
  components: {
    BarChart,
    HorizontalBarChart,
  },
  props: {
    selected: {
      type: String,
      default: null,
    },
    chartData: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    height: {
      type: Number,
      default: 350,
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const onLabelClick = label => {
      if (!props.horizontal) {
        emit('update:selected', label)
      }
    }
    return { onLabelClick }
  },
})
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
}

.back-button {
  position: absolute;
  top: 4px;
  left: 4px;
}
</style>
