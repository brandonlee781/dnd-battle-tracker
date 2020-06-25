<template>
  <v-card-actions class="actions px-5 pb-5">
    <v-row>
      <v-col cols="6">
        <v-text-field v-model="newNpc.name" label="Name" />
      </v-col>
      <v-col cols="3">
        <v-text-field v-model="newNpc.count" label="Count" type="number" />
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="newNpc.initiative"
          label="Initiative"
          type="number"
        />
      </v-col>
    </v-row>
    <v-row class="pr-4">
      <v-spacer />
      <v-btn color="primary" @click="onSubmit">
        Create New NPC
      </v-btn>
    </v-row>
  </v-card-actions>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import cuid from 'cuid'

const getNpc = () => ({
  name: '',
  count: null,
  initiative: 0,
})

export default defineComponent({
  name: 'NewNpcForm',
  setup(props, { root }) {
    const newNpc = ref(getNpc())
    const onSubmit = () => {
      if (newNpc.value.name.length) {
        const id = cuid()
        root.$store.commit('ADD_NPC', { ...newNpc.value, id })
        newNpc.value = getNpc()
      }
    }
    return { newNpc, onSubmit }
  },
})
</script>

<style lang="scss" scoped>
.actions {
  flex-flow: column;
  align-items: flex-end;
}
</style>
