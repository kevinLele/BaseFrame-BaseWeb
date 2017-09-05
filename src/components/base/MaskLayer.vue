<template>
  <div class="maskLayer" :class="{show:show}">
    <div class="maskLayerBg" :class="{hidden:!showMask}"></div>
    <div class="maskLayerMainContent">
      <div class="maskLayerContainer">
        <div class="maskLayerContent">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default{
    props: {
      show: Boolean,
      showMask: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {}
    },
    methods: {},
    mounted(){
    },
    components: {}
  }
</script>

<style scoped>
  .maskLayer {
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0px;
    left: 0px;
    display: none;
    z-index: 99999;
  }

  .maskLayerBg {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color:rgba(0,0,0,0.5);
    opacity: 0.8;
    -moz-opacity: 0.8;
    filter: alpha(opacity=80);
  }

  .maskLayerMainContent {
    position: absolute;
    height: 100%;
    width: 100%;
    display: table;
  }

  .maskLayerContainer {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
  }

  .maskLayerContent {
    display: inline-block;
    text-align: left;
  }

  .show {
    display: block;
  }

  .hidden {
    display: none;
  }
</style>
