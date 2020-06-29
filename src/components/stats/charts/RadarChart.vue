<script>
import { Radar, mixins } from 'vue-chartjs'
import Chart from 'chart.js'
const { reactiveProp } = mixins
export default {
  extends: Radar,
  mixins: [reactiveProp],
  name: 'RadarChart',
  props: ['chartData', 'options'],
  mounted() {
    this.renderChart(this.chartData, this.mergedOptions)
  },
  computed: {
    mergedOptions() {
      return {
        ...this.options,
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
