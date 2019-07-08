<template>
  <div
    :class="{'is-active': dropdownActive}"
    class="dropdown">
    <a
      v-on-clickaway="handleClickAway"
      class="dropdown-trigger"
      @click="handleClick">
      <span>
        <strong>{{ regionLabel }}</strong>
        <i class="fal fa-chevron-down" />
      </span>          
    </a>

    <transition name="slide-down-fade">
      <div
        v-if="dropdownActive" 
        class="dropdown-menu">
        <div class="dropdown-content">
          <nuxt-link
            v-for="region in regions" 
            :key="region.id" 
            :to="`/${currentView}/${region.id}`"
            class="dropdown-item"
            @click.native="handleClick">
            {{ region.label }}
          </nuxt-link>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import REGIONS from '~/constants/regions.js'

export default {
  mixins: [clickaway],

  data() {
    return {
      dropdownActive: false,
      regions: REGIONS
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      const region = this.regions.find(d => d.id === this.regionId)
      return region ? region.label : ''
    },
    currentView() {
      return this.$store.getters.currentView
    }
  },

  methods: {
    handleClick() {
      this.dropdownActive = !this.dropdownActive
    },
    handleClickAway() {
      this.dropdownActive = false
    }
  }
}
</script>
