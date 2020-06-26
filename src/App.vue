<template>
  <v-app>
    <v-main v-resize="onResize">
      <v-navigation-drawer
        v-if="!isMobile"
        v-model="drawer"
        app
        permanent
        mini-variant
        class="nav-drawer"
      >
        <div class="nav-drawer">
          <v-list dense nav>
            <v-list-item v-if="user" to="/combat">
              <v-icon>mdi-sword-cross</v-icon>
            </v-list-item>
            <v-list-item v-if="user" to="/rolls">
              <v-icon>mdi-book-open-page-variant</v-icon>
            </v-list-item>
            <v-list-item to="/stats">
              <v-icon>mdi-chart-arc</v-icon>
            </v-list-item>
          </v-list>
          <v-spacer />
          <LoginMenu />
        </div>
      </v-navigation-drawer>
      <v-app-bar v-if="isMobile" class="app-bar">
        <v-btn text shaped v-if="user" to="/combat">
          <v-icon>mdi-sword-cross</v-icon>
        </v-btn>
        <v-btn text shaped v-if="user" to="/rolls">
          <v-icon>mdi-book-open-page-variant</v-icon>
        </v-btn>
        <v-btn text shaped to="/stats">
          <v-icon>mdi-chart-arc</v-icon>
        </v-btn>
        <v-spacer />
        <LoginMenu />
      </v-app-bar>
      <transition name="page" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from '@vue/composition-api'
import LoginMenu from '@/components/LoginMenu.vue'
import { useState } from './use/vuex-hooks'
import { AppState } from './store'

export default defineComponent({
  name: 'App',
  components: {
    LoginMenu,
  },
  setup() {
    const isMobile = ref(false)
    const { user } = useState<AppState>({
      user: state => state.user,
    })
    const onResize = () => {
      const width = window.innerWidth
      if (width > 800) {
        isMobile.value = false
      } else {
        isMobile.value = true
      }
    }
    onMounted(() => onResize())
    return { drawer: true, user, onResize, isMobile }
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

.app-bar-list {
  display: flex !important;
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
