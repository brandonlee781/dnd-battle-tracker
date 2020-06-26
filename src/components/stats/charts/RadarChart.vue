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
        animation: {
          ...this.options.animation,
          duration: 1,
          onComplete: function() {
            const chartInstance = this.chart,
              ctx = chartInstance.ctx
            ctx.font = Chart.helpers.fontString(
              Chart.defaults.global.defaultFontSize,
              Chart.defaults.global.defaultFontStyle,
              Chart.defaults.global.defaultFontFamily
            )
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'

            this.data.datasets.forEach(function(dataset, i) {
              const meta = chartInstance.controller.getDatasetMeta(i)
              meta.data.forEach(function(bar, index) {
                const data = Math.round(dataset.data[index])
                if (data !== 0) {
                  ctx.fillText(data, bar._model.x, bar._model.y - 5)
                }
              })
            })
          },
        },
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
