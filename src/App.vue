<template>
  <div class="main_viewport">
    <Headers></Headers>
    <div class="container">
      <div class="wrap">
        <div class="menubar">
          <Navs></Navs>
        </div>
        <div class="content">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import "babel-polyfill"
  import Navs from "./components/nav.vue"
  import Headers from "./components/header.vue"
  export default {
    name: 'app',
    data(){
      return {}
    },
    components: {
      Navs: Navs,
      Headers: Headers
    }
  }
</script>

<style>
  .main_viewport {
    height: 100%;
  }

  .container {
    height: calc(100vh - 60px);
    overflow: auto;
  }

  .wrap {
    display: table;
    table-layout: fixed;
    height: 100%;
    width: 100%;
  }

  .menubar {
    vertical-align: top;
    width: 14vw;
    background-color: #32404E;
    display: table-cell;
    overflow: hidden;
  }

  .content {
    vertical-align: top;
    background-color: #eeeeee;
    display: table-cell;
  }
</style>
