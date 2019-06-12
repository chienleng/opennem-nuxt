<template>
  <div
    :class="{'is-active': dropdownActive}"
    class="dropdown">
    <a
      class="dropdown-trigger"
      @click="handleClick">
      <span>
        <strong>{{ regionLabel }}</strong>
        <!-- <font-awesome-icon class="fal" :icon="iconDown" /> -->
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
            :class="{ selected: isCurrentSelection(region.id)}"
            :to="`/energy/${region.id}`"
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
export default {
  data() {
    return {
      dropdownActive: false,
      regions: [
        {
          id: 'nem',
          label: 'All Regions'
        },
        {
          id: 'nsw1',
          label: 'New South Wales'
        },
        {
          id: 'qld1',
          label: 'Queensland'
        },
        {
          id: 'sa1',
          label: 'South Australia'
        },
        {
          id: 'tas1',
          label: 'Tasmania'
        },
        {
          id: 'vic1',
          label: 'Victoria'
        }
      ]
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      const region = this.regions.find(d => d.id === this.regionId)
      return region ? region.label : ''
    }
  },

  methods: {
    isCurrentSelection() {
      return false
    },
    handleClick() {
      this.dropdownActive = !this.dropdownActive
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
