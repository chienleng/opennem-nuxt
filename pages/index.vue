<template>
  <section>
    <h1>Loading</h1>
  </section>
</template>

<script>
export default {
  layout: 'default',
  // middleware: 'root-redirect',

  created() {
    // TODO: redirect from Hash
    console.log(this.$route.hash, this.$route.params.region)
    if (this.$route.hash === `#/region/qld1/energy`) {
      this.$router.push({ path: `energy/qld1` })
    } else {
      this.$router.push({ path: `energy/nem` })
    }

    if (
      this.$route.hash === `#/widget` ||
      this.$route.hash === `#/widget/small`
    ) {
      this.$router.push({ path: `widget/small` })
    }

    if (this.$route.hash === `#/widget/large`) {
      this.$router.push({ path: `widget/large` })
    }
  }
}
</script>
