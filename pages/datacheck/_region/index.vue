<template>
  <section>
    <header>
      <p>fetching: {{ url }}</p>
      <p>data items: {{ nemLength }}</p>
    </header>

    <div>
      <DataList :nemData="data"/>
    </div>

    <div>
      <DataTable 
        :data="flattenData"
        :columns="columns" />
    </div>
  </section>
</template>

<script>
import data from '~/static/data/nem.json'
import axios from 'axios'
import DataService from '~/services/DataService.js'
import DataTransformService from '~/services/DataTransformService.js'
import DataList from '~/components/DataList.vue'
import DataTable from '~/components/DataTable.vue'

export default {
  components: {
    DataList,
    DataTable
  },

  data() {
    return {
      data: [],
      flattenData: [],
      columns: {},
      url: ''
    }
  },

  asyncData({ params }) {
    return DataService.getEnergyByRegionYear('sa1', 2017).then(res => {
      return {
        data: res.data,
        flattenData: DataTransformService.flatten(res.data),
        columns: DataTransformService.getColumns(res.data),
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
