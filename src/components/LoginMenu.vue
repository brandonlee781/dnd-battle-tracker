<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-width="200"
    offset-x
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-if="user" icon disabled>
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-btn v-else icon v-on="on" v-bind="attrs">
        <v-icon>mdi-lock</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-text>
        {{ error }}
        <v-text-field v-model="username" label="Username" />
        <v-text-field v-model="password" type="password" label="Password" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="login">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import firebase from 'firebase'
import { useMutations, useState } from '@/use/vuex-hooks'
import { AppState } from '../store'

export default defineComponent({
  name: '',
  setup() {
    const { setUser } = useMutations({ setUser: 'SET_USER' })
    const menu = ref(false)
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const { user } = useState<AppState>({
      user: state => state.user,
    })

    const login = () => {
      firebase
        .auth()
        .signInWithEmailAndPassword(username.value, password.value)
        .then(result => {
          setUser({
            user: result?.user?.email,
          })
          username.value = ''
          password.value = ''
          menu.value = false
        })
        .catch(e => (error.value = e))
    }
    return { menu, user, username, password, error, login }
  },
})
</script>

<style lang="scss" scoped></style>
