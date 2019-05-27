<template>
  <div
    style="padding: 10px;">
    <div style="display: flex">
      <div style="width: 60%" >
        <StackedAreaVis 
          :data="flattenData"
          :domains="domains"
          :step="step"
          :vis-height="350"/>
      </div>
      
      <Summary
        :fuel-techs="domains"
        :data="flattenData"
        :period="period"
        style="width: 40%" />
    </div>
  </div>
</template>

<script>
import Summary from '~/components/Summary'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'

export default {
  components: {
    Summary,
    StackedAreaVis
  },

  props: {
    flattenData: {
      type: Array,
      default: () => []
    },
    period: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      default: () => ''
    },
    domains: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      selectedId: ''
    }
  },

  computed: {
    step() {
      return this.type === 'energy'
    }
  },

  methods: {
    itemSelected(id) {
      this.selectedId = id
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
