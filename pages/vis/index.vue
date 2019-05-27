<template>
  <div>
    <h1>Stacked Area</h1>

    <stacked-area-vis
      v-if="hasData"
      :vis-data="visData"
      :step="false"
      :vis-height="350" />
  </div>
</template>

<script>
import StackedAreaVis from '~/components/Vis/StackedArea2.vue'

export default {
  components: {
    StackedAreaVis
  },

  data() {
    return {
      visData: {},
      chartData: [],
      domains: []
    }
  },

  computed: {
    hasData() {
      return this.visData.data && this.visData.data.length > 0
    }
  },

  mounted() {
    const fetchDomains = this.fetchData('/data/fueltechs.json')
    const fetchFlatten = this.fetchData('/data/flatten.json')

    Promise.all([fetchDomains, fetchFlatten]).then(responses => {
      // this.domains = responses[0]
      // this.chartData = responses[1]

      this.visData = {
        domains: responses[0],
        data: responses[1]
      }
    })
  },

  methods: {
    fetchData(url) {
      return new Promise(resolve => {
        fetch(url)
          .then(response => response.json())
          .then(responseJson => {
            resolve(responseJson)
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
