<template>
  <nav>
    <nuxt-link to="/">Home</nuxt-link> |
    <nuxt-link to="/datacheck">Data Check</nuxt-link> |
    <nuxt-link to="/allregions">All Regions</nuxt-link> |
    <nuxt-link to="/dailyreport">Daily Report</nuxt-link>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  background-color: #333;
  text-align: left;
  padding: 0.3rem;
  color: #999;
  // position: fixed;
  // top: 0;
  // left: 0;
  // right: 0;

  a {
    color: #999;
    text-decoration: none;

    &.nuxt-link-exact-active {
      color: #fff;
    }
  }
}
</style>
