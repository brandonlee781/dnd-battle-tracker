<script>
import { Bar, mixins } from 'vue-chartjs'
import Chart from 'chart.js'
const { reactiveProp } = mixins
export default {
  extends: Bar,
  mixins: [reactiveProp],
  name: 'BarChart',
  props: ['chartData', 'options'],
  mounted() {
    this.renderChart(this.chartData, this.mergedOptions)
  },
  computed: {
    mergedOptions() {
      return {
        ...this.options,
        onClick: e => {
          const chart = this.$data._chart
          const { bottom, top, ticks: yTicks } = chart.scales['y-axis-0']
          const { left, right, ticks: xTicks } = chart.scales['x-axis-0']
          const mousePoint = Chart.helpers.getRelativePosition(e, chart)
          const clickX = chart.scales['x-axis-0'].getValueForPixel(mousePoint.x)
          const clickY = Math.round(
            chart.scales['y-axis-0'].getValueForPixel(mousePoint.y)
          )
          let clickedXLabel = xTicks[clickX]
          const clickedYLabel = yTicks[clickY]

          if (clickX === -1 && mousePoint.x < 165) {
            const { center, width, label } = chart.scales['x-axis-0'].min
            const minStart = center - (width / 2) // eslint-disable-line
            if (mousePoint.x > minStart) {
              clickedXLabel = label
            }
          }

          if (clickedXLabel && mousePoint.y < bottom && mousePoint.y > top) {
            this.$emit('click:x-axis', clickedXLabel)
          }
          if (clickedYLabel && mousePoint.x > left && mousePoint.x < right) {
            this.$emit('click:y-axis', clickedYLabel)
          }
        },
        legend: {
          ...this.options.legend,
        },
        tooltips: {
          ...this.options.tooltips,
        },
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
