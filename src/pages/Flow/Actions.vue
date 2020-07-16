<script>
import LogRocket from 'logrocket'
import { mapGetters, mapActions } from 'vuex'

import DeleteButton from '@/components/DeleteFlowButton'

export default {
  components: {
    DeleteButton
  },
  props: {
    archived: {
      required: true,
      type: Boolean
    },
    flow: {
      required: true,
      type: Object
    },
    flowGroup: {
      required: true,
      type: Object
    },
    scheduled: {
      required: true,
      type: Boolean
    },
    versions: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      // Alert data
      alertShow: false,
      alertMessage: '',
      alertType: null,
      alertLink: null,
      scheduleLoading: false,
      selectedVersion: +this.$route.query.version || null
    }
  },
  computed: {
    ...mapGetters('tenant', ['tenant', 'role']),
    isQuickRunnable() {
      if (!this.flow.parameters) return true

      return this.flow.parameters.reduce((result, param) => {
        if (param.required) return false
        return result
      }, true)
    },
    isReadOnlyUser() {
      return this.role === 'READ_ONLY_USER'
    },
    isScheduled: {
      get() {
        if (this.archived) return false
        return this.flow.is_schedule_active
      },
      set() {
        return
      }
    },
    schedule() {
      return this.flow.schedule?.clocks[0] || this.flowGroup.schedule?.clocks[0]
    }
  },
  watch: {
    $route(val) {
      if (this.selectedVersion == val.query?.version) return
      this.selectedVersion = val.query.version || null
    }
  },
  mounted() {
    let version = this.versions.find(v => v.value == this.selectedVersion)

    if (this.selectedVersion && !version) {
      this.selectedVersion = null
    }
  },
  methods: {
    ...mapActions('alert', ['setAlert']),
    _changeVersion(val) {
      if (val) {
        let query = { ...this.$route.query, version: val }
        this.$router.replace({
          query: query
        })
      } else {
        let query = { ...this.$route.query }
        delete query.version
        this.$router.replace({ query: query })
      }
    },
    archiveFlow() {},
    deleteFlow() {},
    goToRunFlowPage() {
      this.$router.push({
        name: 'flow',
        params: { id: this.flow.id },
        query: { run: '' }
      })
    },
    async quickRunFlow() {
      try {
        const { data, errors } = await this.$apollo.mutate({
          mutation: require('@/graphql/Mutations/create-flow-run.gql'),
          variables: {
            id: this.flow.id
          },
          errorPolicy: 'all'
        })
        if (data?.create_flow_run?.id) {
          this.$router.push({
            name: 'flow-run',
            params: { id: data?.create_flow_run?.id }
          })
        }
        if (errors) {
          this.quickRunErrorAlert(errors[0]?.message)
        }
      } catch (err) {
        this.quickRunErrorAlert()
        LogRocket.captureException(err)
      }
    },
    quickRunErrorAlert(err) {
      if (err && err?.includes('archived')) {
        this.alertShow = true
        this.alertMessage =
          'This flow version is now archived.  You have a newer version of your flow.'
        this.alertLink = {
          name: 'flow',
          params: { id: this.flow.id },
          query: { versions: '' }
        }
        this.alertType = 'error'
      } else {
        this.alertShow = true
        this.alertMessage = 'There was a problem running your flow'
        this.alertType = 'error'
      }

      this.setAlert({
        alertShow: this.alertShow,
        alertMessage: this.alertMessage,
        alertType: this.alertType,
        alertLink: this.alertLink
      })
    },
    async scheduleFlow() {
      try {
        this.scheduleLoading = true
        let response

        if (this.isScheduled) {
          response = await this.$apollo.mutate({
            mutation: require('@/graphql/Mutations/set-schedule-inactive.gql'),
            variables: {
              id: this.flow.id
            }
          })

          if (response.data.setScheduleInactive.success) {
            this.alertShow = true
            this.alertMessage = 'Schedule set to paused'
            this.alertType = 'info'
          } else {
            this.alertShow = true
            this.alertMessage =
              '"Something went wrong. Please wait a few moments and try again."'
            this.alertType = 'error'
          }
        } else if (!this.isScheduled) {
          response = await this.$apollo.mutate({
            mutation: require('@/graphql/Mutations/set-schedule-active.gql'),
            variables: {
              id: this.flow.id
            }
          })

          if (response.data.setScheduleActive.success) {
            this.alertShow = true
            this.alertMessage = 'Schedule set to active'
            this.alertType = 'info'
          } else {
            this.alertShow = true
            this.alertMessage =
              '"Something went wrong. Please wait a few moments and try again."'
            this.alertType = 'error'
          }
        }
      } catch (error) {
        this.alertShow = true
        this.alertMessage =
          '"Something went wrong. Please wait a few moments and try again."'
        this.alertType = 'error'
        throw error
      } finally {
        this.scheduleLoading = false
      }
    },
    unarchiveFlow() {}
  }
}
</script>

<template>
  <div
    class="pa-0 mb-2 d-flex align-center"
    :class="$vuetify.breakpoint.smAndDown ? 'justify-center' : 'justify-end'"
  >
    <v-select
      :value.sync="selectedVersion"
      :items="versions"
      dense
      label="Version"
      hide-details
      style="width: 100px !important;"
      @change="_changeVersion"
    />

    <v-tooltip
      bottom
      max-width="340"
      :open-delay="isReadOnlyUser || !isQuickRunnable || archived ? 0 : 750"
    >
      <template v-slot:activator="{ on }">
        <div v-on="on">
          <v-btn
            class="vertical-button mr-2 py-1 position-relative"
            color="primary"
            text
            tile
            small
            data-cy="start-flow-quick-run"
            :disabled="isReadOnlyUser || !isQuickRunnable || archived"
            @click="quickRunFlow"
          >
            <v-icon>fa-rocket</v-icon>
            <v-icon
              small
              class="position-absolute"
              :style="{
                bottom: '-4px',
                right: '8px',
                transform: 'rotate(15deg)'
              }"
            >
              offline_bolt
            </v-icon>
            <div class="mb-1">Quick Run</div>
          </v-btn>
        </div>
      </template>
      <span v-if="isReadOnlyUser">
        Read-only users cannot run flows.
      </span>
      <span v-else-if="!isQuickRunnable">
        This flow has required parameters that must be set before a run. Select
        the RUN tab to launch this flow.
      </span>
      <span v-else-if="archived">
        This flow is archived and cannot be run.
      </span>
      <span v-else>
        <p>
          Run this flow immediately, with a generated flow run name and default
          parameters.
        </p>

        <p class="mb-0">
          Select the RUN tab if you want to customize the flow run name, set
          specific parameters, or provide context.
        </p>
      </span>
    </v-tooltip>

    <div class="vertical-divider"></div>

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div v-on="on">
          <v-badge
            :value="schedule == null && isScheduled"
            color="warning"
            icon="priority_high"
            overlap
            top
            left
          >
            <div class="vertical-button">
              <v-switch
                v-model="isScheduled"
                data-cy="schedule-toggle"
                hide-details
                class="mr-1 v-input--vertical"
                color="primary"
                :loading="scheduleLoading"
                :disabled="isReadOnlyUser || archived"
                @change="scheduleFlow"
              >
                <template v-slot:label>
                  <v-btn small text disabled tile class="mb-1">
                    Schedule
                  </v-btn>
                </template>
              </v-switch>
            </div>
          </v-badge>
        </div>
      </template>
      <span v-if="isReadOnlyUser">
        Read-only users cannot schedule flows.
      </span>
      <span v-else-if="schedule == null && isScheduled">
        This flow is trying to schedule runs but has no schedules! Visit this
        flow's
        <span class="font-weight-bold">Settings > Schedules</span> to set a new
        schedule.
      </span>
      <span v-else-if="archived">
        Archived flows cannot be scheduled.
      </span>
      <span v-else>
        Turn {{ isScheduled ? 'off' : 'on' }} this flow's schedule
      </span>
    </v-tooltip>

    <DeleteButton :flow="flow" :flow-group="flowGroup" type="flow" />

    <!-- <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div v-on="on">
          <div class="vertical-button ml-2">
            <v-switch
              v-model="isArchived"
              disabled
              hide-details
              class="v-input--vertical"
              color="codePink"
            >
              <template v-slot:label>
                <v-btn tile small text disabled class="mb-1">Archive</v-btn>
              </template>
            </v-switch>
          </div>
        </div>
      </template>
      <span v-if="isReadOnlyUser">
        Read-only users cannot archive flows.
      </span>
      <span v-else>Coming Soon!</span>
    </v-tooltip> -->

    <!-- We'll add favoriting later, which will show this flow as a favorite on the dashboard -->

    <!-- <v-btn text icon color="prefect">
        <v-icon>favorite</v-icon>
      </v-btn> -->
  </div>
</template>

<style lang="scss">
.vertical-divider {
  border-left: 0.5px solid rgba(0, 0, 0, 0.26);
  border-right: 0.5px solid rgba(0, 0, 0, 0.26);
  height: 75%;
}

// stylelint-disable
.vertical-button {
  &.v-btn--tile {
    height: auto !important;
  }

  .v-btn__content {
    flex-direction: column-reverse !important;
  }
}
//stylelint-enable

// stylelint-disable
.v-input--vertical {
  margin-top: 0 !important;
  padding-top: 0 !important;

  .v-input__slot {
    flex-direction: column-reverse !important;

    .v-input--selection-controls__input {
      align-self: center;
      margin: auto !important;
      transform: scale(0.9);
    }
  }

  .v-btn:not(.v-btn--round).v-size--small {
    height: unset !important;
  }
}
// stylelint-enable
</style>