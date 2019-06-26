<template>
  <footer>
    <p>v3</p>
    <nuxt-link to="/about">About</nuxt-link> 
  </footer>
</template>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

footer {
  background: lightgrey;
  padding: $app-padding / 4 $app-padding;

  @include tablet {
    position: absolute;
    left: 0;
    right: 0;
  }
}
</style>
