<template>
  <div
    :class="{'is-active': dropdownActive}"
    class="dropdown">
    <a
      v-on-clickaway="handleClickAway"
      class="dropdown-trigger"
      @click="handleClick">
      <span>
        <strong>{{ viewLabel }}</strong>
        <i class="fal fa-chevron-down" />
      </span>          
    </a>

    <transition name="slide-down-fade">
      <div
        v-if="dropdownActive" 
        class="dropdown-menu">
        <div class="dropdown-content">
          <nuxt-link
            v-for="view in views" 
            :key="view.id" 
            :class="{ selected: isCurrentSelection(view)}"
            :to="`/${view.id}/${regionId}`"
            class="dropdown-item"
            @click.native="handleClick">
            {{ view.label }}
          </nuxt-link>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [clickaway],

  data() {
    return {
      dropdownActive: false,
      views: [
        {
          id: 'energy',
          label: 'Energy'
        },
        {
          id: 'facilities',
          label: 'Facilities'
        }
      ]
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    currentView() {
      return this.$store.getters.currentView
    },
    viewLabel() {
      const view = this.views.find(d => d.id === this.currentView)
      return view ? view.label : ''
    }
  },

  methods: {
    isCurrentSelection() {
      return false
    },
    handleClick() {
      this.dropdownActive = !this.dropdownActive
    },
    handleClickAway() {
      this.dropdownActive = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.dropdown-trigger {
  font-family: $header-font-family;
  font-size: 1.6rem;
  font-weight: 700;
  margin-right: $app-padding;
  padding-right: $app-padding;
  border-right: $border-style;
  color: #000;
}
</style>
