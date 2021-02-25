
<template>
  <div>
    <svg-icon icon-class="settings" @click.native="setting = true"/>
  </div>
</template>
<script>
export default {
  name: 'SysSettings',
    data() {
      return {}
    },
    computed: {
      setting: {
        get() {
          return this.$store.state.settings.showSettings
        },
        set(val) {
          this.$store.dispatch('settings/changeSetting', {
            key: 'showSettings',
            value: val
          })
        }
      }
    }
}
</script>