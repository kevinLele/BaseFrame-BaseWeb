<template>
  <li v-if="data.children.length > 0" class="tree-node">
    <ul @click="selected(data.id,$event)" @mouseover="mouseover" @mouseout="mouseout" :sn="data.sn">
      <li>
        <span :style="getStyle(data)" :subNodeId="data.sn"
              @click.stop="zoom(data,$event)"
              class="zoom-btn zoom-out"></span>
        <span>{{data[field]}}</span>
      </li>
    </ul>
    <transition v-on:enter="enter">
      <ul v-if="data.showChildren" :nodeId="data.sn" style="display:none;">
        <tree-node @selected="childrenSelected" v-for="item in data.children" :key="item.sn" :data="item"
                   :expandLevel="subExpandLevel" :field="field"></tree-node>
      </ul>
    </transition>
  </li>

  <li v-else @click="selected(data.id,$event)" @mouseover="mouseover" @mouseout="mouseout" :sn="data.sn">
    <span :style="getStyle(data)">{{data[field]}}</span>
  </li>
</template>

<script>
  export default{
    props: {
      data: Object,
      field: String,
      expandLevel: {
        type: Number,
        default: 0
      }
    },
    data(){
      return {}
    },
    methods: {
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
      zoom: function (data, event) {
        var el = $(event.currentTarget);
        el.toggleClass("zoom-in");

        if (!data.showChildren) {
          data.showChildren = true;
        } else {
          var nodeId = el.attr("subNodeId");
          $("[nodeId='" + nodeId + "']").slideToggle("fast");
        }
      },
      getStyle: function (data) {
        var marginLeft = 0;

        if (data.children && data.children.length > 0) {
          if (data.level == 1) {
            marginLeft = "0px";
          } else {
            marginLeft = (data.level * 20 - 40) + "px";
          }
        } else {
          marginLeft = (data.level * 20 - 20) + "px";
        }

        return {
          marginLeft: marginLeft
        };
      }
    },
    computed: {
      subExpandLevel: function () {
        return this.expandLevel - 1;
      }
    },
    beforeCreate(){
      //解决组件自己调用自己的问题,　此处不能使用webpack的方式进行导入，否则会引起环境依赖的错误
      this.$options.components.TreeNode = require('./GridTreeNode.vue')
    },
    mounted(){
      if (this.expandLevel > 0) {
        this.data.showChildren = true;
      }
    },
    beforeUpdate(){
      if (this.expandLevel > 0) {
        this.data.showChildren = true;
      }
    },
    watch: {},
    components: {}
  }
</script>

<style scoped>
  .tree-node > ul > li:not(.tree-node) {
    border-bottom: 1px solid #cccccc;
  }

  li {
    font-family: "iconfont";
  }

  .zoom-btn {
    width: 20px;
    padding: 10px 0px;
    text-align: center;
    cursor: pointer;
    box-sizing: content-box;
  }

  .zoom-btn:hover {
    background-color: #dddddd;
  }

  .zoom-out:before {
    content: "\e315";
  }

  .zoom-in:before {
    content: "\e313"
  }

  .node-hover {
    background-color: #f7f7f7;
  }

  .node-selected {
    background-color: #ffefbb;
  }
</style>
