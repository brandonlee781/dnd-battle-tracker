<template>
  <v-container fluid>
    <v-row>
      <v-col xl="3" lg="4" md="6" cols="12">
        <PartyRollCard />
      </v-col>
      <v-col xl="9" lg="8" md="6" cols="12">
        <PartyRollLog />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import PartyRollCard from '@/components/rolls/PartyRollCard.vue'
import PartyRollLog from '@/components/rolls/PartyRollLog.vue'

export default defineComponent({
  name: 'Skills',
  components: {
    PartyRollCard,
    PartyRollLog,
  },
})
</script>

<style lang="scss" scoped></style>
