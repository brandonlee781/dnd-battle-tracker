<template>
  <v-app>
    <v-main>
      <v-navigation-drawer v-model="drawer" app permanent mini-variant>
        <div class="nav-drawer">
          <v-list dense nav>
            <v-list-item v-if="user" to="/combat">
              <v-icon>mdi-sword-cross</v-icon>
            </v-list-item>
            <v-list-item to="/stats">
              <v-icon>mdi-chart-arc</v-icon>
            </v-list-item>
          </v-list>
          <v-spacer />
          <LoginMenu />
        </div>
      </v-navigation-drawer>
      <transition name="page" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import LoginMenu from '@/components/LoginMenu.vue'
import { useState } from './use/vuex-hooks'
import { AppState } from './store'

export default defineComponent({
  name: 'App',
  components: {
    LoginMenu,
  },
  setup() {
    const { user } = useState<AppState>({
      user: state => state.user,
    })
    return { drawer: true, user }
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
