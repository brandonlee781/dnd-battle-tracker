<template>
  <v-app>
    <v-main>
      <v-navigation-drawer v-model="drawer" app permanent mini-variant>
        <div class="nav-drawer">
          <v-list dense nav>
            <v-list-item to="/combat">
              <v-icon>mdi-sword-cross</v-icon>
            </v-list-item>
            <v-list-item to="/stats">
              <v-icon>mdi-chart-arc</v-icon>
            </v-list-item>
          </v-list>
          <v-spacer />
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-width="200"
            offset-x
          >
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-if="user">mdi-account</v-icon>
              <v-btn v-else icon v-on="on" v-bind="attrs">
                <v-icon>mdi-lock</v-icon>
              </v-btn>
            </template>

            <v-card>
              <v-card-text>
                <v-text-field v-model="username" label="Username" />
                <v-text-field
                  v-model="password"
                  type="password"
                  label="Password"
                />
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="login">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </div>
      </v-navigation-drawer>
      <transition name="page" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import firebase from 'firebase'
import { useState, useMutations } from './use/vuex-hooks'
import { AppState } from './store'
// import { fb } from './db'
export default defineComponent({
  name: 'App',
  setup() {
    const { setUser } = useMutations({ setUser: 'SET_USER' })
    const menu = ref(false)
    const username = ref('')
    const password = ref('')
    const drawer = true

    const { user } = useState<AppState>({
      user: state => state.user,
    })

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser({ user })
      }
    })

    const login = () => {
      firebase
        .auth()
        .signInWithEmailAndPassword(username.value, password.value)
        .then(result => {
          setUser({
            credentials: result.credential,
            user: result.user,
          })
          username.value = ''
          password.value = ''
          menu.value = false
        })
    }
    return { drawer, menu, user, username, password, login }
  },
})
</script>

<style>
.nav-drawer {
  display: flex !important;
  flex-flow: column nowrap;
  align-items: center;
  height: 100%;
  padding-bottom: 8px;
}
.page-enter-active,
.page-leave-active {
  transition: opacity 0.8s, transform 0.8s;
}
.page-enter,
.page-leave-to {
  opacity: 0;
  transform: translateY(-30%);
}
</style>
