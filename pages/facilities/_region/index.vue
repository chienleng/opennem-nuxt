<template>
  <div>
    {{ regionId }}
  </div>
</template>

<script>
export default {
  layout: 'main',
  computed: {
    regionId() {
      return this.$route.params.region
    }
  },
  created() {
    this.$store.dispatch('currentView', 'facilities')
  }
}
</script>
