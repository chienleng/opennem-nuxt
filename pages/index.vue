<template>
  <section>
    <h1>nothing here</h1>
  </section>
</template>

<script>
export default {
  layout: 'default',

  mounted() {
    // TODO: redirect from Hash
    console.log(this.$route.hash)
    if (this.$route.hash === `#/datacheck/${this.$route.params.region}`) {
      console.log('redirect from hash')
      this.$router.push({ path: `datacheck/${this.$route.params.region}` })
    }
  }
}
</script>
