<template>
  <div class="container-fluid">
    <app-nav />
    <app-header />
    <nuxt/>
    <app-footer />
  </div>
</template>

<script>
import AppNav from '~/components/layout/Nav'
import AppHeader from '~/components/layout/AppHeader'
import AppFooter from '~/components/layout/AppFooter'

export default {
  middleware: 'meta',
  components: {
    AppNav,
    AppHeader,
    AppFooter
  }
}
</script>

<style lang="scss">
.container-fluid {
  margin-bottom: 2rem;
}
</style>
