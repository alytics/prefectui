<script>
import { mapGetters } from 'vuex'
import ConnectionMenu from '@/components/Nav/ConnectionMenu'
import GlobalSearch from '@/components/GlobalSearchBar/GlobalSearch'
import HelpMenu from '@/components/Nav/HelpMenu'
import NotificationMenu from '@/components/Nav/NotificationMenu'
import Links from '@/components/Nav/Links'
import TeamSideNavButton from '@/components/Nav/TeamSideNavButton'
import UserMenu from '@/components/Nav/UserMenu'

export default {
  components: {
    ConnectionMenu,
    GlobalSearch,
    HelpMenu,
    Links,
    NotificationMenu,
    TeamSideNavButton,
    UserMenu
  },
  data() {
    return {
      active: false,
      menu: false
    }
  },
  computed: {
    ...mapGetters('api', ['isCloud']),
    ...mapGetters('tenant', ['tenant']),
    isTransparent() {
      return this.$route.name === 'not-found'
    },
    isWelcome() {
      return (
        this.$route.name === 'welcome' ||
        this.$route.name === 'onboard-resources' ||
        this.$route.name === 'name-team' ||
        this.$route.name === 'accept'
      )
    },
    navBarColor() {
      return this.isTransparent
        ? 'transparent'
        : this.isCloud
        ? 'primary'
        : 'secondary'
    },
    slug() {
      return this.tenant?.slug
    }
  }
}
</script>

<template>
  <v-app-bar app elevate-on-scroll fixed :color="navBarColor">
    <router-link
      :to="{
        name: 'dashboard',
        params: {
          tenant: slug
        }
      }"
      exact
    >
      <v-btn
        icon
        :x-large="$vuetify.breakpoint.smAndUp"
        :large="$vuetify.breakpoint.xsOnly"
      >
        <img
          class="logo"
          src="@/assets/logos/logomark-white.svg"
          alt="The Prefect Logo"
        />
      </v-btn>
    </router-link>

    <TeamSideNavButton />

    <v-divider vertical class="white vertical-divider my-auto mx-2" />

    <!-- We can't use a v-if-else chain here; -->
    <!-- For some reason the default slot never renders if we do. -->
    <!-- (likely a Vuetify bug) -->
    <template v-if="$vuetify.breakpoint.mdAndDown" #extension>
      <Links v-if="$vuetify.breakpoint.mdAndDown" />
    </template>

    <Links v-if="!$vuetify.breakpoint.mdAndDown" />

    <v-spacer></v-spacer>

    <GlobalSearch v-if="$vuetify.breakpoint.smAndUp" />

    <HelpMenu />

    <NotificationMenu />

    <ConnectionMenu />

    <UserMenu v-if="isCloud" />
  </v-app-bar>
</template>

<style lang="scss" scoped>
.vertical-divider {
  height: 50%;
  min-height: 0;
  opacity: 0.5;
}

.logo {
  height: 100%;
}
</style>

<style lang="scss">
.v-app-bar {
  @media screen and (max-width: 600px) {
    /* stylelint-disable-next-line */
    .v-toolbar__content {
      padding: 0 !important;
    }
  }

  z-index: 8 !important;
}
</style>
