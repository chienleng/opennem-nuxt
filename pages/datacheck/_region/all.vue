<template>
  <section style="display: flex">
    <div style="width: 30%">
      <h1>Data getEnergyByRegion</h1>
      <p>fetching: {{ url }}</p>
      <p>items: {{ nemLength }}</p>

      <DataList :nemData="data"/>
    </div>
    <div style="width: 70%">side</div>
  </section>
</template>

<script>
import axios from 'axios'
import DataService from '~/services/DataService.js'
import DataList from '~/components/DataList.vue'

export default {
  // fetch({ store, params }) {
  //   return DataService.getEnergyByRegionYear('nsw1', 2017).then(res => {
  //     url = res.config.url
  //     store.commit('nem', res.data)
  //   })
  // },

  components: {
    DataList
  },

  data() {
    return {
      data: [],
      url: ''
    }
  },

  asyncData({ params }) {
    return DataService.getEnergyByRegion(params.region).then(res => {
      return {
        data: res.data,
        url: res.config.url
      }
    })
  },

  computed: {
    nemLength() {
      return this.data.length
    }
  },

  mounted() {
    // this.$store.commit('nem', this.data)
  }
}
</script>
