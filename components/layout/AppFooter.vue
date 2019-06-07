<template>
  <footer>
    <p>v3</p>
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
