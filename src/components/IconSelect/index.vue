<template>
  <div class="icon-body">
    <el-input v-model="name" style="position: relative;" clearable placeholder="请输入图标名称" @clear="filterIcons" @input.native="filterIcons">
      <i slot="suffix" class="el-icon-search el-input__icon" />
    </el-input>
    
    <div class="icon-list">
      <el-scrollbar style="height:100%;width: 100%;">
        <div v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
          <svg-icon :icon-class="item" style="height: 30px;width: 16px;" />
          <span>{{ item }}</span>
        </div>
      </el-scrollbar>
    </div>
    
  </div>
</template>

<script>
import icons from './requireIcons'
export default {
  name: 'IconSelect',
  data() {
    return {
      name: '',
      iconList: icons
    }
  },
  methods: {
    filterIcons() {
      this.iconList = icons
      if (this.name) {
        this.iconList = this.iconList.filter(item => item.includes(this.name))
      }
    },
    selectedIcon(name) {
      this.$emit('selected', name)
      document.body.click()
    },
    reset() {
      this.name = ''
      this.iconList = icons
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .icon-body {
    width: 100%;
    padding: 5px;
    overflow: hidden;
    .icon-list {
      height: 200px;
      overflow: hidden;
      div {
        height: 30px;
        line-height: 30px;
        margin-bottom: -5px;
        cursor: pointer;
        width: 33%;
        float: left;
      }
      span {
        display: inline-block;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
      }
    }
  }
</style>
