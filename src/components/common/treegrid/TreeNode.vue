<template>
  <li v-if="data.children && data.children.length > 0 && data.show" class="tree-node">
    <ul :sn="data.sn" :class="{hide:hideRootNode}">
      <li>
        <span :style="getStyle(data)" :subNodeId="data.sn"
              @click.stop="zoom(data,$event)"
              class="zoom-btn zoom-out" :class="{'zoom-in':data.showChildren}">
        </span><checkbox v-model="checked" @change="checkChange" :halfSelected="halfChecked" v-if="hasCheckbox"></checkbox><span
          class="root-node-out" :class="{'root-node-in':data.showChildren, 'selected-node': !hasCheckbox && data.id == defaultId}"
          @click.stop="selected(data.id, data.name, $event)">{{data[field]}}</span>
      </li>
    </ul>
    <transition @enter="enter">
      <ul v-if="data.showChildren" :nodeId="data.sn" style="display:none;">
        <tree-node v-for="item in data.children" :hasCheckbox="hasCheckbox"
                   :key="item.sn" :data="item" @selected="childrenSelected" @unselected="unselected"
                   :checkStatus="item.checkStatus" @checkStatusChange="childrenCheckStatusChange"
                   :field="field" :expandLevel="subExpandLevel" :hideRoot="hideRoot" :defaultId="defaultId"></tree-node>
      </ul>
    </transition>
  </li>
  <li v-else-if="data.show" :sn="data.sn" style="line-height:30px;">
    <template v-if="hasCheckbox">
      <checkbox v-model="checked" @change="checkChange" :style="getStyle(data)"></checkbox><span
        class="leaf-node" @click.stop="selected(data.id, data.name, $event)">{{data[field]}}</span>
    </template>
    <span v-else class="leaf-node" :style="getStyle(data)" :class="{'selected-node':data.id == defaultId}"
          @click.stop="selected(data.id, data.name, $event)">{{data[field]}}</span>
  </li>
</template>

<script>
  import Checkbox from "../Checkbox.vue"

  export default{
    props: {
      data: Object,
      field: String,
      expandLevel: {
        type: Number,
        default: 0
      },
      hasCheckbox: {
        type: Boolean,
        default: false
      },
      checkStatus: {
        type: String,
        default: "unchecked"
      },
      hideRoot: {
        type: Boolean,
        default: false
      },
      defaultId: String
    },
    data(){
      var checked = false;
      var halfChecked = false;

      if (this.checkStatus == "checked") {
        checked = true;
        halfChecked = false;
      } else if (this.checkStatus == "halfChecked") {
        checked = true;
        halfChecked = true;
      } else {
        checked = false;
        halfChecked = false;
      }

      return {
        checked: checked,
        halfChecked: halfChecked
      }
    },
    computed: {
      subExpandLevel: function () {
        return this.expandLevel - 1;
      },
      hideRootNode: function () {
        //只有二级节点才是root结点
        if (this.hideRoot && this.data.level == 2) {
          return true;
        } else {
          return false;
        }
      }
    },
    methods: {
      childrenSelected: function (id, title) {
        this.$emit("selected", id, title);
      },
      childrenCheckStatusChange: function (id, checkStatus) {
        //当子结点的选择状态发生变化时需要遍历所有子结点
        //如果子结点均为已选状态时将当前结点的选择状态设置为已选
        //如果子结点均为未选状态时将当前结点的选择状态设置为未选
        //其它情况设置为半选择状态(即部分子结点已选的状态)
        var hasChecked = false;
        var hasUnchecked = false;
        var hasHalfChecked = false;

        for (var idx in this.data.children) {
          var child = this.data.children[idx];

          //忽略隐藏的节点
          if (child.show == false) {
            continue;
          }

          if (child.id == id) {
            child.checkStatus = checkStatus;
          }

          if (child.checkStatus == "checked") {
            hasChecked = true;
          } else if (child.checkStatus == "unchecked") {
            hasUnchecked = true;
          } else if (child.checkStatus == "halfChecked") {
            hasHalfChecked = true;
          }
        }

        if (hasChecked && !hasUnchecked && !hasHalfChecked) {
          this.$emit("checkStatusChange", this.data.id, "checked");
        } else if (hasUnchecked && !hasChecked && !hasHalfChecked) {
          this.$emit("checkStatusChange", this.data.id, "unchecked");
        } else {
          this.$emit("checkStatusChange", this.data.id, "halfChecked");
        }
      },
      enter: function (el, done) {
        $(el).slideToggle("fast");
        done();
      },
      selected: function (id, title, event) {
        if (this.hasCheckbox) {
          this.checked = !this.checked;
          this.checkChange();
        } else {
          var el = $(event.currentTarget);
          $(".selected-node").removeClass("selected-node");
          el.toggleClass("selected-node");
          this.$emit("selected", id, title);
        }
      },
      unselected: function (id, title) {
        this.$emit("unselected", id, title);
      },
      checkChange: function () {
        if (this.checked) {
          //将其下所有子结点的checkstatus设置为checked
          this.setCheckStatus(this.data, "checked");

          //向父结点发送事件表明当前结点的状态为已选
          this.$emit("checkStatusChange", this.data.id, "checked");

          this.$emit("selected", this.data.id, this.data.name);
        } else {
          //将其下所有子结点的checkstatus设置为unchecked
          this.setCheckStatus(this.data, "unchecked");

          //向父结点发送事件表明当前结点的状态为未选
          this.$emit("checkStatusChange", this.data.id, "unchecked");

          this.$emit("unselected", this.data.id, this.data.name);
        }
      },
      zoom: function (data, event) {
        var el = $(event.currentTarget);
        el.toggleClass("zoom-in");

        if (this.hasCheckbox) {
          el.next().next().toggleClass("root-node-in");
        } else {
          el.next().toggleClass("root-node-in");
        }

        if (!data.showChildren) {
          data.showChildren = true;
        } else {
          var nodeId = el.attr("subNodeId");
          $(".tree ul[nodeId='" + nodeId + "']").slideToggle("fast");
        }
      },
      getStyle: function (data) {
        var marginLeft = 0;

        if (data.children && data.children.length > 0) {
          if (data.level == 1) {
            marginLeft = "0px";
          } else {
            if (this.hideRoot) {
              marginLeft = (data.level * 25 - 75) + "px";
            } else {
              marginLeft = (data.level * 25 - 55) + "px";
            }
          }
        } else {
          if (this.hideRoot) {
            marginLeft = (data.level * 25 - 51) + "px";
          } else {
            marginLeft = (data.level * 25 - 31) + "px";
          }
        }

        return {
          marginLeft: marginLeft
        };
      },
      setCheckStatus(node, checkStatus){
        node.checkStatus = checkStatus;

        if (node.children && node.children.length
          && node.children.length > 0) {
          for (var idx in node.children) {
            var child = node.children[idx];
            this.setCheckStatus(child, checkStatus)
          }
        }
      }
    },
    beforeCreate(){
      //解决组件自己调用自己的问题,　此处不能使用webpack的方式进行导入，否则会引起环境依赖的错误
      this.$options.components.TreeNode = require('./TreeNode.vue')
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
    watch: {
      "checkStatus": function (newValue) {
        if (newValue == "checked") {
          this.checked = true;
          this.halfChecked = false;
        } else if (newValue == "halfChecked") {
          this.checked = true;
          this.halfChecked = true;
        } else {
          this.checked = false;
          this.halfChecked = false;
        }
      }
    },
    components: {
      Checkbox: Checkbox
    }
  }
</script>

<style scoped>
  .tree-node li span {
    cursor: default;
    padding: 5px;
  }

  li {
    font-family: "iconfont";
    vertical-align: middle;
  }

  .tree-node .zoom-btn {
    display: inline-block;
    text-align: center;
    cursor: pointer;
    box-sizing: content-box;
    padding:0px 5px;
  }

  .zoom-out:before {
    content: "\e315";
  }

  .zoom-in:before {
    content: "\e313"
  }

  .root-node-out:before {
    content: "\e92f";
    margin-left: 0px;
    margin-right: 5px;
  }

  .root-node-in:before {
    content: "\e930";
    margin-left: 0px;
    margin-right: 5px;
  }

  .root-node-out {
    font-size: 11pt;
    color: #3E6481;
  }

  .root-node-in {
    font-size: 11pt;
    color: #3E6481;
  }

  .leaf-node:before {
    content: "\e9bc";
    margin-left: 0px;
    margin-right: 5px;
  }

  .leaf-node {
    font-size: 11pt;
    color: #3E6481;
  }

  .selected-node {
    border: 1px solid #3E6481;
  }

  .hide {
    display: none;
  }
</style>
