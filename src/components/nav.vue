<template>
  <div class="nav">
    <my-menu v-for="cfg in menuList" @zoom="zoom" :config="cfg" :key="cfg.name" ref="menu"></my-menu>
  </div>
</template>

<script>
  import MyMenu from "./common/Menu.vue"
  import TreeUtil from "../utils/TreeUtil"

  export default {
    data(){
      return {
        menuList: []
      }
    },
    components: {
      MyMenu: MyMenu
    },
    methods: {
      zoom(menu){
        for (var i in this.$refs.menu) {
          var vc = this.$refs.menu[i];

          if (vc.id != menu.id && vc.close) {
            vc.close();
          }
        }
      }
    },
    mounted(){
      this.$http.get("./restful/capermission/findByUserRolePer").then(
        (res) => {
          res.body.content.push({
            id: "-1",
            name: "根结点"
          });

          this.menuList = TreeUtil(res.body.content, ["code"]).children[0].children;
        }
      )
    }
  }
</script>

<style scoped>
  .nav {
    width: 14vw;
    padding-top: 5px;
  }
</style>
