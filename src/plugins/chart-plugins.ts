import Chart from 'chart.js'
import 'chartjs-plugin-datalabels'
import 'chartjs-plugin-hierarchical'
import { Context } from 'chartjs-plugin-datalabels'

export interface LocalChart extends Chart {
  $totalizer?: {
    utmost: number
    totals: number[]
  }
}
export interface LabelContext extends Omit<Context, 'chart'> {
  chart: LocalChart
}

Chart.plugins.register({
  id: 'totalizer',
  beforeUpdate: (chart: LocalChart) => {
    let utmost = 0
    const totals: number[] = []
    chart.data.datasets?.forEach((dataset, datasetIndex) => {
      if (chart.isDatasetVisible(datasetIndex)) {
        utmost = datasetIndex
        dataset.data?.forEach((value, index) => {
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
