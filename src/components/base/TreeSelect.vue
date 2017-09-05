<template>
  <div :style="selectStyle" @click="click" class="normal">
    <span style="display:inline-block;height:100%;">{{title}}</span>
    <input ref="input" :value="value" style="display: none"/>
    <div class="select-btn"></div>
    <div class="select-content" :style="treeStyle">
      <tree @selected="selected" @defaultSelected="defaultSelected" :defaultSelectedId="defaultValue"
            :api="api" :field="field" :expandLevel="1"></tree>
    </div>
  </div>
</template>

<script>
  import Tree from "./Tree.vue"

  export default{
    props: {
      value: String,
      api: String,
      readonly: {
        type: Boolean,
        default: false
      },
      field: {
        type: String,
        default: "name"
      },
      selectStyle: {
        type: Object,
        default: function () {
          return {
            width: "400px",
            height: "32px"
          }
        }
      }
    },
    data(){
      return {
        treeStyle: {
          display: "none",
          width: this.selectStyle.width
        },
        defaultValue: this.value,
        title: ""
      }
    },
    methods: {
      defaultSelected: function (id, title) {
        this.title = title;
        this.$emit('input', id)
      },
      selected: function (id, title) {
        this.title = title;
        this.$emit('input', id)
        $(".select-content").slideToggle("fast");
      },
      click: function (event) {
        if (!this.readonly) {
          $(event.currentTarget).toggleClass("clicked")
          $(event.currentTarget).find(".select-content").slideToggle("fast");
        }
      }
    },
    mounted(){
    },
    components: {
      Tree: Tree
    },
    watch: {}
  }
</script>

<style scoped>
  .normal {
    margin: 0px;
    border: 1px solid #a9a9a9;
    border-radius: 4px;
    background-color: #ffffff;
    padding: 5px;
    padding-left: 10px;
    font-family: "iconfont";
    cursor: default;
    text-align: left;
    line-height: normal;
  }

  .select-btn {
    margin: 0px;
    /*border: 1px solid #a9a9a9;*/
    padding: 1px;
    float: right;
    border-radius: 2px;
    height: 100%;
    line-height: 100%;
  }

  .select-btn:before :hover {
    color: #5cadff;
  }

  .select-btn:before {
    font-size: 9pt;
    content: '\ea3e';
  }

  .clicked .select-btn:before {
    content: "\ea3a";
    color: #5cadff;
  }

  .clicked, .normal:hover {
    border: 1px solid #5cadff;
    outline: 0;
    -webkit-box-shadow: 0 0px 10px #d6ebff;
    box-shadow: 0 0px 10px #d6ebff;
  }

  .select-content {
    background-color: #ffffff;
    width: 400px;
    height: 300px;
    position: absolute;
    margin-top: 8px;
    margin-left: -11px;
    border: 1px solid #eeeeee;
    box-shadow: 0 0px 10px #d6ebff;
  }
</style>
