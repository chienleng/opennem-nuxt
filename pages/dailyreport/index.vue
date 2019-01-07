<template>
  <div>
    <report-card :report-data="data" />
  </div>
</template>

<script>
import data from '~/static/data/daily.json'
import ReportCard from '~/components/ReportCard/index.vue'

export default {
  components: {
    ReportCard
  },

  data() {
    return {
      data
    }
  }
}
</script>
