<template>
  <v-card>
    <v-card-title>Battles</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          :input-value="value === 'all'"
          @click="$emit('input', 'all')"
        >
          <v-list-item-title>All Battles</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-for="battle in battles"
          :key="battle.id"
          :input-value="value === battle.id"
          @click="$emit('input', battle.id)"
        >
          <v-list-item-title>
            {{ battle.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useCollection from '@/use/useCollection'
import { Battle } from '@/store'

export default defineComponent({
  name: 'BattleList',
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  setup() {
    const { error, collectionData } = useCollection<Battle>('battles', {
      onMounted: true,
      orderBy: { field: 'createdDate', direction: 'desc' },
    })
    return { error, battles: collectionData }
  },
})
</script>

<style lang="scss" scoped></style>
