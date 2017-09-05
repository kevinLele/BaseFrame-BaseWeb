<template>
  <ul class="tree">
    <tree-node @selected="selected" @unselected="unselected" :field="field" :hasCheckbox="hasCheckbox"
               @checkStatusChange="checkStatusChange" :checkStatus="rows.checkStatus" :defaultId="defaultId"
               :expandLevel="expandLevel" :hideRoot="hideRoot" :data="rows"></tree-node>
  </ul>
</template>

<script>
  import TreeUtil from "../../utils/TreeUtil"
  import TreeNode from "./treegrid/TreeNode.vue"

  export default{
    props: {
      api: String,
      apiType: {
        type: String,
        default: "get"
      },
      refresh: {
        type: Boolean,
        default: false
      },
      requestBody: {
        type: Object,
        default: function () {
          return {};
        }
      },
      field: {
        type: String,
        default: "name"
      },
      expandLevel: {
        type: Number,
        default: 1
      },
      defaultSelectedId: {
        type: String,
        default: ""
      },
      hasCheckbox: {
        type: Boolean,
        default: false
      },
      hideRoot: {
        type: Boolean,
        default: false
      },
      selectedNodes: {
        type: Array,
        default: function () {
          return [];
        }
      },
      showNodes: {
        type: Array,
        default: function () {
          return [];
        }
      },
      hideNodes: {
        type: Array,
        default: function () {
          return [];
        }
      }
    },
    data(){
      return {
        defaultId: this.defaultSelectedId,
        rows: {}
      }
    },
    methods: {
      selected: function (id, title) {
        this.$emit("selected", id, title);
      },
      unselected: function (id, title) {
        this.$emit("unselected", id, title);
      },
      checkStatusChange: function (id, checkStatus) {
        //当子结点的选择状态发生变化时需要遍历所有子结点
        //如果子结点为全选判态时将当前结点的选择状态设置为已选
        //如果子结点均为未选状态时将当前结点的选择状态设置为未选
        //其它情况设置为半选择状态(即部分子结点已选的状态)
        var hasChecked = false;
        var hasUnchecked = false;
        var hasHalfChecked = false;

        for (var idx in this.rows.children) {
          var child = this.rows.children[idx];

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
          this.rows.checkStatus = "checked"
          this.$emit("checkStatusChange", id, "checked")
        } else if (hasUnchecked && !hasChecked && !hasHalfChecked) {
          this.rows.checkStatus = "unchecked"
          this.$emit("checkStatusChange", id, "unchecked")
        } else {
          this.rows.checkStatus = "halfChecked"
          this.$emit("checkStatusChange", id, "halfChecked")
        }
      },
      checkStatusInit(node){
        if (node.children && node.children.length
          && node.children.length > 0) {
          var hasChecked = false;
          var hasUnchecked = false;
          var hasHalfChecked = false;

          for (var idx in node.children) {
            var child = node.children[idx];
            var checkStatus = "";

            if (child.children && child.children.length
              && child.children.length > 0) {
              checkStatus = this.checkStatusInit(child);
            } else {
              checkStatus = child.checkStatus;
            }

            if (checkStatus == "checked") {
              hasChecked = true;
            } else if (checkStatus == "unchecked") {
              hasUnchecked = true;
            } else if (checkStatus == "halfChecked") {
              hasHalfChecked = true;
            }
          }

          if (hasChecked && !hasUnchecked && !hasHalfChecked) {
            node.checkStatus = "checked"
          } else if (hasUnchecked && !hasChecked && !hasHalfChecked) {
            node.checkStatus = "unchecked"
          } else {
            node.checkStatus = "halfChecked"
          }
        }

        return node.checkStatus;
      },
      showStatusInit(node, selectedIds){
        var id = node.id;
        var isContain = false;

        for (var i in selectedIds) {
          if (selectedIds[i].id == id) {
            isContain = true;
            break;
          }
        }

        if (isContain) {
          node.show = true;
        } else {
          node.show = false;
        }

        if (node.children && node.children.length
          && node.children.length > 0) {
          for (var idx in node.children) {
            var child = node.children[idx];
            this.showStatusInit(child, selectedIds);
          }
        }
      },
      hideStatusInit(node, selectedIds){
        var id = node.id;
        var isContain = false;

        for (var i in selectedIds) {
          if (selectedIds[i].id == id) {
            isContain = true;
            break;
          }
        }

        if (isContain) {
          node.show = false;
        } else {
          node.show = true;
        }

        if (node.children && node.children.length
          && node.children.length > 0) {
          for (var idx in node.children) {
            var child = node.children[idx];
            this.hideStatusInit(child, selectedIds);
          }
        }
      },
      showStatusReset(node){
        node.show = true;

        if (node.children && node.children.length
          && node.children.length > 0) {
          for (var idx in node.children) {
            this.showStatusReset(node.children[idx]);
          }
        }
      },
      search(){
        var idArr = new Array();

        for (var i in this.selectedNodes) {
          var node = this.selectedNodes[i];
          idArr[node.id] = node;
        }

        var rsp;

        if (this.apiType == "get") {
          rsp = this.$http.get(this.api);
        } else {
          rsp = this.$http.post(this.api, this.requestBody);
        }

        rsp.then(
          (res) => {
            var rows = res.body.content;

            for (var idx in rows) {
              var row = rows[idx];

              if (idArr[row.id]) {
                row.checkStatus = "checked";
              } else {
                row.checkStatus = "unchecked";
              }
            }

            rows.push({
              id: "-1",
              name: "根结点"
            });

            if (this.defaultId == "") {
              this.defaultId = "0";
            }

            for (var idx in rows) {
              var row = rows[idx];

              //用于读取数据后与默认的id进行比较，如果是默认的ID则将已数据以事
              //件的方式回传给父组件(用于treeselect回显已选择的项的标题)
              if (row.id == this.defaultId) {
                this.$emit("defaultSelected", row.id, row.name);
                break;
              }
            }

            this.rows = TreeUtil(rows, ["checkStatus"]).children[0];
            this.checkStatusInit(this.rows);

            if (this.hideNodes.length > 0) {
              this.hideStatusInit(this.rows, this.hideNodes);
            }
          }
        )
      }
    },
    mounted(){
      this.search();
    },
    components: {
      TreeNode: TreeNode
    },
    watch: {
      showNodes: function (newValue) {
        this.showStatusReset(this.rows);
        this.showStatusInit(this.rows, newValue);
      },
      hideNodes: function (newValue) {
        this.showStatusReset(this.rows);
        this.hideStatusInit(this.rows, newValue);
      },
      refresh: function (newValue) {
        if (newValue) {
          this.search();
          this.$emit("refreshed");
        }
      }
    }
  }
</script>

<style scoped>
  .tree {
    height: 100%;
    width: 100%;
    overflow: auto;
  }

  .tree ul, li {
    list-style: none;
    margin: 0px;
    padding: 0px;
    line-height: 30px;
    white-space: nowrap;
  }
</style>
