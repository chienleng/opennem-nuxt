<template>
  <div class="container-fluid">
    <app-nav />
    <nuxt/>
  </div>
</template>

<script>
import AppNav from '~/components/Nav.vue'

export default {
  middleware: 'meta',
  components: {
    AppNav
  }
}
</script>

<style lang="scss">
.container-fluid {
  margin-bottom: 2rem;
}
</style>
