<template>
  <div>
    {{ regionId }}
  </div>
</template>

<script>
export default {
  computed: {
    regionId() {
      return this.$route.params.region
    }
  }
}
</script>
