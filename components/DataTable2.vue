<template>
  <div class="table-container">
    <h1>rows: {{ data.length }}</h1>
    <table class="table is-narrow is-fullwidth is-bordered is-striped">
      <thead>
        <tr>
          <th
            v-for="(c, i) in columns"
            :key="i"
          >{{ c }}</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(d, i) in data"
          :key="i">
          <td
            v-for="(k, i) in keys"
            :key="i">
            <span v-if="k === 'date'">{{ d.date | formatDate }}</span>
            <span v-else>{{ d[k] ? d[k].value : '' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    keys() {
      return Object.keys(this.columns)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-container {
  margin-top: 1rem;
}
</style>
