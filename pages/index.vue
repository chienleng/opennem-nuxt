<template>
  <section class="container">
    <div>
      <logo/>
      <!-- <h1 class="title">
        OpenNEM
      </h1>
      <h2 class="subtitle">
        An Open Platform for National Electricity Market Data
      </h2>
      <div class="links">
        <a
          href="https://github.com/opennem"
          target="_blank"
          class="button--grey">GitHub</a>
      </div> -->
    </div>
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  layout: 'default',
  components: {
    Logo
  },
  mounted() {
    // TODO: redirect from Hash
    console.log(this.$route.hash)
    if (this.$route.hash === `#/datacheck/${this.$route.params.region}`) {
      console.log('here')
      this.$router.push({ path: `datacheck/${this.$route.params.region}` })
    }
  }
}
</script>

<style lang="scss">
.title {
  display: block;
  font-size: 2rem;
  color: #35495e;
}

.subtitle {
  font-weight: 300;
  font-size: 1.5rem;
  color: #526488;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
