<template>
  <header>
    <div>
      <button
        class="button is-rounded is-primary is-inverted"
        @click="handleCancelClick">Cancel</button>
      <button
        class="button is-rounded is-primary"
        @click="handleExportClick">Download</button>
    </div>
  </header>
</template>

<script>
export default {
  methods: {
    handleCancelClick() {
      this.$emit('exportCancel')
    },

    handleExportClick() {
      this.$emit('exportClick')
    }
  }
}
</script>
