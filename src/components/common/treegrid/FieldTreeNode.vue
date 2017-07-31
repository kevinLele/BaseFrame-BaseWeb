<template>
  <li v-if="data.children.length > 0" class="tree-node">
    <ul @click="selected(data.id,$event)" @mouseover="mouseover" @mouseout="mouseout" :sn="data.sn">
      <template v-for="field in fields">
        <li v-if="field.isCheckbox" :style="field.fieldStyle">
          <input type="checkbox"/>
        </li>
        <li v-else-if="field.field == 'operationField'" :style="field.fieldStyle">
          <div v-if="data.id == ''">&nbsp;</div>
          <template v-else v-for="operation in field.operations">
            <span v-if="$permissionValid(operation.permission)"
                  :class="operation.iconClass"
                  :title="operation.title"
                  @click.stop="clickBtn(data.id,operation.type)"></span>
          </template>
        </li>
        <li v-else :style="field.fieldStyle">
          <div v-if="data[field.field] == '' || data[field.field] == undefined">&nbsp;</div>
          <span v-else :title="data[field.field]">{{data[field.field]}}</span>
        </li>
      </template>
    </ul>
    <transition v-on:enter="enter">
      <ul v-if="data.showChildren" :nodeId="data.sn" style="display:none;">
        <field-tree-node v-for="item in data.children"
                         @selected="childrenSelected"
                         @clickBtn="childrenClickBtn"
                         :key="item.sn"
                         :data="item"
                         :fields="fields"></field-tree-node>
      </ul>
    </transition>
  </li>
  <li v-else @click="selected(data.id,$event)" @mouseover="mouseover" @mouseout="mouseout" :sn="data.sn" class="normal-node">
    <ul>
      <template v-for="field in fields">
        <li v-if="field.isCheckbox" :style="field.fieldStyle">
          <input type="checkbox"/>
        </li>
        <li v-else-if="field.field == 'operationField'" :style="field.fieldStyle">
          <span v-for="operation in field.operations"
                :class="operation.iconClass"
                :title="operation.title"
                @click.stop="clickBtn(data.id,operation.type)"
                v-if="$permissionValid(operation.permission)"></span>
        </li>
        <li v-else :style="field.fieldStyle">
          <div v-if="data[field.field] == ''">&nbsp;</div>
          <span v-else :title="data[field.field]">{{data[field.field]}}</span>
        </li>
      </template>
    </ul>
  </li>
</template>

<script>
  export default {
    props: {
      data: Object,
      fields: Array
    },
    data(){
      return {}
    },
    beforeCreate(){
      //解决组件自己调用自己的问题,　此处不能使用webpack的方式进行导入，否则会引起环境依赖的错误
      this.$options.components.FieldTreeNode = require('./FieldTreeNode.vue')
    },
    methods: {
      clickBtn: function (id, btnType) {
        this.$emit("clickBtn", id, btnType);
      },
      childrenClickBtn: function (id, btnType) {
        this.$emit("clickBtn", id, btnType);
      },
      childrenSelected: function (id) {
        this.$emit("selected", id);
      },
      selected: function (id, event) {
        var sn = $(event.currentTarget).attr("sn");

        //已选择的行再次选择时进行取消选择操作，将高亮的样式去除
        if ($(event.currentTarget).hasClass("node-selected")) {
          $("[sn='" + sn + "']").removeClass("node-selected");

          //取消时将空的id以事件的形式回传给父组件
          this.$emit("selected", "");
        } else {
          //将之前已选择的行去掉高亮
          $(".node-selected").removeClass("node-selected");
          $("[sn='" + sn + "']").addClass("node-selected");
          this.$emit("selected", id);
        }
      },
      mouseover: function (event) {
        var sn = $(event.currentTarget).attr("sn");
        $("[sn='" + sn + "']").addClass("node-hover");
      },
      mouseout: function (event) {
        var sn = $(event.currentTarget).attr("sn");
        $("[sn='" + sn + "']").removeClass("node-hover");
      },
      enter: function (el, done) {
        $(el).slideToggle("fast");
        done();
      },
    },
    mounted(){
    },
    watch: {},
    components: {}
  }
</script>

<style scoped>
  .tree-node {
    font-family: "iconfont";
  }

  .normal-node{
    font-family: "iconfont";
  }

  .tree-node > ul > li:not(.tree-node) {
    border-bottom: 1px solid #cccccc;
  }

  .node-hover {
    background-color: #f7f7f7;
  }

  .node-selected {
    background-color: #ffefbb;
  }

  li {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .remove, .edit, .view {
    padding: 8px;
  }

  .remove:hover, .edit:hover, .view:hover {
    background-color: #cccccc;
    color: #0374d0;
  }

  .remove:before {
    content: "\e9ac"
  }

  .edit:before {
    content: "\e908"
  }

  .view:before {
    content: "\e9ce"
  }
</style>
