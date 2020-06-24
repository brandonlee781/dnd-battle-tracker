<template>
  <v-data-table
    :headers="headers"
    :items="actions"
    :items-per-page="pageLength"
    :footer-props="{
      'items-per-page-options': [pageLength, pageLength * 2, pageLength * 3],
    }"
    class="action-table"
  ></v-data-table>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { DataTableHeader } from 'vuetify'

export interface ActionTableItem {
  battle: string
  round: number
  turn: number
  character: string
  target: string
  damage?: number
  healing?: number
}

interface ActionTableProps {
  actions: ActionTableItem[]
  headers: DataTableHeader[]
  pageLength: number
}

export default defineComponent<ActionTableProps>({
  name: 'ActionTable',
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Array,
      default: () => [],
    },
    pageLength: {
      type: Number,
      default: 5,
    },
  },
})
</script>

<style lang="scss" scoped>
.action-table {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  margin-top: 4px;
  padding-top: 4px;
}
</style>
