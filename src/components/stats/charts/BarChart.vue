<script>
import { Bar, mixins } from 'vue-chartjs'
import 'chartjs-plugin-datalabels'
import Chart from 'chart.js'
const { reactiveProp } = mixins
export default {
  extends: Bar,
  mixins: [reactiveProp],
  name: 'BarChart',
  props: ['chartData', 'options'],
  mounted() {
    this.addPlugin({
      id: 'totalizer',
      beforeUpdate: chart => {
        let utmost = 0
        const totals = {}
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          if (chart.isDatasetVisible(datasetIndex)) {
            utmost = datasetIndex
            dataset.data.forEach((value, index) => {
              totals[index] = (totals[index] || 0) + value
            })
          }
        })

        chart.$totalizer = {
          utmost: utmost,
          totals: totals,
        }
      },
    })
    this.renderChart(this.chartData, this.mergedOptions)
  },
  computed: {
    mergedOptions() {
      return {
        ...this.options,
        onClick: e => {
          const chart = this.$data._chart
          const mousePoint = Chart.helpers.getRelativePosition(e, chart)
          const clickX = chart.scales['x-axis-0'].getValueForPixel(mousePoint.x)
          const clickY = chart.scales['y-axis-0'].getValueForPixel(mousePoint.y)
          const clickedXLabel = chart.scales['x-axis-0'].ticks[clickX]
          const clickedYLabel = chart.scales['y-axis-0'].ticks[clickY]
          if (clickedXLabel && mousePoint.y < 260) {
            this.$emit('click:x-axis', clickedXLabel)
          }
          if (clickedYLabel) {
            this.$emit('click:y-axis', clickedYLabel)
          }
        },
        legend: {
          ...this.options.legend,
          // onClick: (event, legendItem) => {
          //   this.$emit('click:legend', legendItem)
          // },
          // onHover: function(event, legendItem) {
          //   const chart = this.chart
          //   const { datasets } = chart.data

          //   datasets.forEach((set, index) => {
          //     if (index !== legendItem.datasetIndex) {
          //       set.backgroundColor = `${set.backgroundColor}44`
          //     }
          //   })
          //   chart.update()
          // },
          // onLeave: function(event, legendItem) {
          //   const chart = this.chart
          //   const { datasets } = chart.data

          //   datasets.forEach((set, index) => {
          //     if (index !== legendItem.datasetIndex) {
          //       set.backgroundColor = `${set.backgroundColor.slice(0, -2)}`
          //     }
          //   })
          //   chart.update()
          // },
        },
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
