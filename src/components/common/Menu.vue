<template>
  <ul>
    <template v-if="this.children.length > 0">
      <li class="menu" @click="zoom">
        <span class="hot">&nbsp;</span>
        <i :class="'icon-' + config.code"></i>
        <span>{{config.name}}</span>
        <span style="position: absolute;right: 20px;top: 4px;font-size: 18px;"
              v-html="isOpen==true?'&#xe313;':'&#xe315;'"></span>
      </li>
      <li class="sub-menu-main" style="display: none;">
        <ul>
          <template v-for="subCfg in this.children">
            <router-link class="menu sub-menu"
                         :to="{name:subCfg.code, params: {id: subCfg.code }}" :key="subCfg.code" tag="li">
              <span class="hot">&nbsp;</span>
              <span style="margin-left:50px;margin-right:5px;font-size: 14pt;" :class="'icon-' + subCfg.code"></span>
              <span>{{subCfg.name}}</span>
            </router-link>
          </template>
        </ul>
      </li>
    </template>
    <router-link v-else class="menu" :to="{name:config.code, params: {id: config.code }}" :key="config.code" tag="li">
      <span class="hot">&nbsp;</span>
      <i :class="'icon-' + config.code"></i>
      <span>{{config.name}}</span>
    </router-link>
  </ul>
</template>

<script>
  export default {
    props: {
      config: Object
    },
    data(){
      if (typeof this.config == "undefined") {
        throw "组件的config属性未配置"
      }

      if (!this.config.isOpen) {
        this.config.isOpen = false;
      }

      if (!this.config.children) {
        this.config.children = new Array();
      }

      return {
        id: this.config.id,
        isOpen: this.config.isOpen,
        children: this.config.children
      }
    },
    methods: {
      zoom(event){
        if (!this.isOpen) {
          $(".nav .sub-menu-main").slideUp("fast");
          this.$emit("zoom", this.$data);
        }

        $(event.currentTarget).next().slideToggle("fast");
        this.isOpen = !this.isOpen;
      },
      close(){
        this.isOpen = false;
      }
    }
  }
</script>

<style scoped>
  li.menu {
    line-height: 64px;
    cursor: pointer;
    white-space: nowrap;
    position: relative;
  }

  li.sub-menu {
    background-color: #2c3845;
  }

  li.menu:hover {
    color: #fff;
    background-color: #3c4a57;
    -webkit-transition: color 0.5s;
    -o-transition: color 0.5s;
    transition: color 0.5s;
  }

  .router-link-active .hot {
    background-color: #35baf6;
  }

  li.router-link-active {
    background-color: #3c4a57;
  }

  [class^="icon-"] {
    position: relative;
    top: 2px;
    width:22px;
  }

  .icon-org:before {
    content: "\ea68";
  }

  .icon-role:before {
    content: "\ea1e";
  }

  .icon-user:before {
    content: "\ea1d";
  }

  .icon-sys:before {
    content: "\ebfc";
  }

  .icon-permission:before {
    content: "\e995";
  }

  .icon-home:before {
    content: '\e9ae';
  }

  .icon-mainMenu:before {
    content: '\e9ae';
  }

  .icon-mainMenu2:before {
    content: "\ebfc";
  }

  .icon-projectApp:before {
    content: "\ecf2";
  }
  .icon-dictionary:before{
  	 content: "\e42a";
  	 font-size: 15pt;
  }
</style>
