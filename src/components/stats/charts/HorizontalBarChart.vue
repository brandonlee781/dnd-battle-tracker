<script>
import { HorizontalBar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
export default {
  extends: HorizontalBar,
  mixins: [reactiveProp],
  name: 'HorizontalBarChart',
  props: ['chartData', 'options'],
  mounted() {
    this.renderChart(this.chartData, this.options)
  },
}
</script>

<style lang="scss" scoped></style>
