<template>
  <div class="table-container">
    <vue-scrolling-table :include-footer="true">
      <template slot="thead">
        <tr>
          <th
            v-for="(c, i) in columns"
            :key="i">
            {{ c }}</th>
        </tr>
      </template>

      <template slot="tbody">
        <tr 
          v-for="(d, i) in data"
          :data-time="d.date"
          :key="i">
          
          <td
            v-for="(k, i) in keys"
            :class=" { 'date-col': k === 'date' } "
            :key="i">
            <span v-if="k === 'date'">{{ d.date | formatDate }}</span>
            <span v-else>{{ d[k] ? d[k].value : '' }}</span>
          </td>

        </tr>
      </template>
    </vue-scrolling-table>

    <!-- <table>
      <caption>rows: {{ data.length }}</caption>
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
    </table> -->
  </div>
  
</template>

<script>
// https://github.com/richardtallent/vue-scrolling-table
import VueScrollingTable from 'vue-scrolling-table'

export default {
  components: {
    VueScrollingTable
  },
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
  height: 45vh;
  padding: 10px;
}
table {
  font-size: 10px;
  width: 100%;
  border-collapse: collapse;
  background-color: transparent !important;
  --dead-area-color: transparent !important;

  th {
    text-align: left;
  }

  td,
  th {
    padding: 3px;
    border-bottom: 1px solid #333;
    border-left: 1px solid #333;
  }

  tr:hover td {
    background-color: #ddd !important;
  }

  .date-col {
    white-space: nowrap;
  }

  &.scrolling {
    .scrollsync {
      background-color: transparent !important;
    }
  }
}

table.scrolling td:first-child,
table.scrolling th:first-child {
  position: -webkit-sticky;
  position: sticky;
  left: 0;
  background-color: #efefef;
}
</style>
