<template>
  <footer>
    <p>v3</p>
  </footer>
</template>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

footer {
  background: yellow;
  padding: $app-padding / 4 $app-padding;

  @include tablet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
