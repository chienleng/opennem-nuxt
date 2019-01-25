<template>
  <div>
    <report-card :report-data="data" />
  </div>
</template>

<script>
import ReportCard from '~/components/ReportCard/index.vue'

export default {
  components: {
    ReportCard
  },

  data() {
    return {
      data: []
    }
  }
}
</script>
