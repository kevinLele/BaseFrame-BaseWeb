<template>
  <div class="tree-grid-wrap">
    <div class="tree-grid">
      <div class="tree-grid-header" style="height:40px; border-bottom: 1px solid #cccccc;">
        <div :style="config.headerStyle">
          <template v-for="field in config.defaultFields">
            <div v-if="field.isCheckbox" :style="field.fieldStyle">
              <input type="checkbox"/>
            </div>
            <div v-else :style="field.fieldStyle">{{field.title}}</div>
          </template>
        </div>
        <div :style="config.fieldStyle">
          <template v-for="field in config.dataFields">
            <div :style="field.fieldStyle">
              {{field.title}}
            </div>
          </template>
        </div>
        <div>{{config.treeFileTitle}}</div>
      </div>
      <div v-if="hasContent" class="tree-grid-content">
        <ul class="normal-field" :style="config.headerStyle">
          <field-tree-node @selected="selected" :fields="config.defaultFields" :data="rows"/>
        </ul>
        <ul class="normal-field" :style="config.fieldStyle">
          <field-tree-node @clickBtn="clickBtn" @selected="selected" :fields="config.dataFields" :data="rows"/>
        </ul>
        <ul class="tree-column">
          <tree-node @selected="selected" :field="config.treeField"
                     :expandLevel="config.expandLevel" :data="rows"></tree-node>
        </ul>
      </div>
      <div v-else　style="line-height:200px;text-align:center;vertical-align:middle;border-bottom:1px solid #cccccc;">
        &nbsp;{{message}}&nbsp;
      </div>
    </div>
  </div>
</template>

<script>
  import TreeUtil from "../../utils/TreeUtil"
  import FieldTreeNode from "./treegrid/FieldTreeNode.vue"
  import TreeNode from "./treegrid/GridTreeNode.vue"

  export default{
    props: {
      config: Object
    },
    data(){
      if (typeof this.config == "undefined") {
        throw "组件的config属性未配置"
      }

      this.config.headerStyle = {
        float: "left"
      };
      this.config.fieldStyle = {
        float: "right"
      }

      if (typeof this.config.expandLevel == "undefined") {
        this.config.expandLevel = 1;
      }

      if (typeof this.config.headerColumnWidth == "undefined") {
        if (this.config.hasCheckboxColumn) {
          this.config.headerStyle.width = "150px";
        } else {
          this.config.headerStyle.width = "120px";
        }
      } else {
        this.config.headerStyle.width = this.config.headerColumnWidth;
      }

      if (typeof this.config.fieldColumnWidth == "undefined") {
        this.config.fieldStyle.width = "500px";
      } else {
        this.config.fieldStyle.width = this.config.fieldColumnWidth;
      }

      if (typeof this.config.defaultFields == "undefined") {
        if (this.config.hasCheckboxColumn) {
          this.config.defaultFields = [{
            field: "sn",
            title: "#",
            fieldStyle: {
              float: "left",
              width: "120px",
              paddingLeft: "15px"
            }
          }, {
            field: "selected",
            isCheckbox: true,
            fieldStyle: {
              textAlign: "center"
            }
          }];
        } else {
          this.config.defaultFields = [{
            field: "sn",
            title: "#",
            fieldStyle: {
              width: "120px",
              paddingLeft: "15px"
            }
          }];
        }
      }

      var operations = new Array();

      if (this.config.hasDeleteBtn) {
        operations.push({
          iconClass: "remove",
          title: "删除",
          type: "remove",
          permission: "org:remove"
        })
      }

      if (this.config.hasEditBtn) {
        operations.push({
          iconClass: "edit",
          title: "编辑",
          type: "edit",
          permission: "org:modify"
        })
      }

      if (this.config.hasViewBtn) {
        operations.push({
          iconClass: "view",
          title: "查看",
          type: "view"
        })
      }

      if (operations.length > 0) {
        this.config.dataFields.unshift({
          field: "operationField",
          title: "操作",
          fieldStyle: {
            float: "right",
            width: "150px",
            textAlign: "center"
          },
          operations: operations
        })
      }

      return {
        message: "",
        rows: {}
      }
    },
    computed: {
      hasContent: function () {
        for (var r in this.rows) {
          return true;
        }

        return false;
      }
    },
    methods: {
      clickBtn(id, btnType){
        this.$emit("clickBtn", id, btnType);
      },
      selected(id){
        this.$emit("selected", id);
      },
      addNode(node){
        var parentId = node.parentId;

        //为根机构时需要重置为空串，与mounted方法中的处理保持一致
        if (parentId == "0") {
          parentId = "";
        }

        this.insertNode(parentId, this.rows, node);
      },
      removeNode(id){
        this.deleteNode(this.rows, id);
      },
      redactNode(node, id){
        this.editNode(this.rows, id, node)
      },
      insertNode(id, node, newNode){
        //如果当前结节即为添加的点的的父节点
        if (node.id == id) {
          newNode.level = node.level + 1;
          newNode.sn = node.sn + "." + (node.children.length + 1);
          node.children.push(newNode);
        } else {
          //在子节点中迭代处理
          var children = node.children;

          if (children && children.length > 0) {
            for (var idx in node.children) {
              var subNode = children[idx];

              //尝试在子结点中添加新node
              this.insertNode(id, subNode, newNode);
            }
          }
        }
      },
      deleteNode(node, id){
        var children = node.children;

        if (children && children.length > 0) {
          for (var idx in children) {
            var subNode = children[idx];

            if (subNode.id == id) {
              children.splice(idx, 1);
              return;
            } else {
              this.deleteNode(subNode, id);
            }
          }
        }
      },
      editNode(nodes, id, node){
        var children = nodes.children;
        if (children && children.length > 0) {
          for (var idx in children) {
            var subNode = children[idx];
            if (subNode.id == id) {
              subNode.name = node.name;
              subNode.code = node.code;
              subNode.linkMan = node.linkMan;
              subNode.phone = node.phone;
              subNode.email = node.email;
              subNode.address = node.address;
              subNode.description = node.description;
              return;
            } else {
              this.editNode(subNode, id, node);
            }
          }
        }
      }
    },
    mounted(){
      this.message = "查询中．．．";
      this.$http.get(this.config.api).then(
        (res) => {
          //插入默认的根机构,id默认为0
          res.body.content.push({
            id: "-1",
            name: "根结点"
          });

          var fieldNames = new Array();
          for (var idx in this.config.dataFields) {
            var dataField = this.config.dataFields[idx];
            fieldNames.push(dataField.field);
          }

          this.rows = TreeUtil(res.body.content, fieldNames).children[0];
          this.rows.id = ""; // 重置为空串的目的是显示时不要将默认的id（值为0）显示出来
          this.rows.code = "";
        }
      )
    },
    watch: {},
    components: {
      FieldTreeNode: FieldTreeNode,
      TreeNode: TreeNode
    }
  }
</script>

<style scoped>

  .tree-grid-wrap {
    height: calc(100% - 49px);
    padding: 20px;
  }

  .tree-grid {
    padding-left: 2%;
    padding-right: 2%;
    padding-bottom: 2%;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0px 1px 2px 1px #ccc;
    min-height: calc(100vh - 150px);
    min-width: 1160px;
  }

  .tree-grid-content {
    border-top: 1px solid #cccccc;
    /*height:200px;*/
    overflow: auto;

  }

  .tree-grid-header div {
    /*text-align: center;组件使用时通过config自定义对齐方式而不是全局居中*/
  }

  .tree-grid ul, li {
    list-style: none;
    margin: 0px;
    padding: 0px;
    line-height: 40px;
    white-space: nowrap;
  }

  .normal-field li {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .tree-column {
    overflow: auto;
  }

  .tree-node {

  }

  .tree-node > ul > li:not(.tree-node) {
    border-bottom: 1px solid #cccccc;
  }

  .tree-grid-header > div {
    line-height: 39px;
    vertical-align: middle;
  }

</style>
