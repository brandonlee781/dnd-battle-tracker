<template>
  <v-list-item class="list-item">
    <div class="wrapper">
      <span class="name">{{ player.name }}</span>
      <v-select
        :value="playerSkill"
        :items="skills.concat(saves)"
        label="Skills"
        class="skills"
        hide-details
        @input="value => setRoll('skill', value)"
      ></v-select>
      <v-select
        :value="playerSave"
        :items="saves"
        label="Saves"
        class="saves"
        hide-details
        @input="value => setRoll('save', value)"
      ></v-select>
      <v-text-field
        v-model="roll"
        label="Roll"
        type="number"
        class="roll"
        hide-details
      ></v-text-field>
      <v-btn raised color="primary" class="enter-btn" @click="onSubmit">
        Enter
      </v-btn>
    </div>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from '@vue/composition-api'
import { PC, RollType, RollData } from '@/store'
import { db } from '../../db'
import cuid from 'cuid'
import { skills, saves } from '@/use/stats/rolls/useRollData'

interface PartyRollListItemProps {
  player: PC
}

export default defineComponent<PartyRollListItemProps>({
  name: 'PartyRollListItem',
  props: {
    player: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { root }) {
    const playerSave: Ref<string | null> = ref(null)
    const playerSkill: Ref<string | null> = ref(null)
    const roll = ref(0)
    const setRoll = (type: RollType, name: string) => {
      if (type === 'save') {
        playerSave.value = name
        root.$nextTick(() => {
          playerSkill.value = null
        })
      } else {
        playerSkill.value = name
        root.$nextTick(() => {
          playerSave.value = null
        })
      }
    }
    const onSubmit = () => {
      const rollObj: Partial<RollData> = {
        id: cuid(),
        player: props.player.id,
        roll: +roll.value,
        date: new Date(),
      }
      if (playerSave.value) {
        rollObj.type = 'save'
        rollObj.save = playerSave.value
      } else if (playerSkill.value) {
        rollObj.type = 'skill'
        rollObj.skill = playerSkill.value
      }
      db.collection('rolls')
        .doc(rollObj.id)
        .set(rollObj)
      playerSave.value = null
      playerSkill.value = null
      roll.value = 0
    }
    return {
      skills,
      saves,
      playerSave,
      playerSkill,
      roll,
      setRoll,
      onSubmit,
    }
  },
})
</script>

<style lang="scss" scoped>
.list-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 8px;
  padding-bottom: 8px;
}
.wrapper {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr 25%;
  grid-template-areas:
    'name name button'
    'skills saves roll';
  width: 100%;

  .name {
    grid-area: name;
  }
  .saves {
    grid-area: saves;
  }
  .skills {
    grid-area: skills;
  }
  .roll {
    grid-area: roll;
  }
  .enter-btn {
    grid-area: button;
  }
}
</style>
