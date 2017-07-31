<template>
  <div class="handlePrivilege">
    <steps :current="current" type="line" ref="steps">
      <step title="系统功能">
        <resource-list v-if="showResourceList" :config="resourceListMemu" ref="menuList"
                       @selected="selected"></resource-list>
      </step>
      <step title="系统按钮">
        <resource-list v-if="current>=1" :config="resourceListButton" ref="buttonList"
                       @selected="selected"></resource-list>
      </step>
      <step title="数据权限">
        <div style="width:736px;height:440px;border:1px solid #ccc">
          <div class="dataAuthority">
            <label><input name="dataAuthority" type="radio" value="oneself" v-model="picked" />仅限本人</label>
          </div>
          <div class="dataAuthority">
            <label><input name="dataAuthority" type="radio" value="unOneself" v-model="picked" />仅限本人及下属</label>
          </div>
          <div class="dataAuthority">
            <label><input name="dataAuthority" type="radio" value="org" v-model="picked" />所在机构</label>
          </div>
          <div class="dataAuthority" style="border:0;">
            <label><input name="dataAuthority" type="radio" value="custom" v-model="picked" />自定义设置</label>
          </div>
          <div style="width: 100%;height: 285px;overflow-y: auto;overflow-x: hidden;" v-if="picked=='custom'">
            <tree ref="tree" api="./restful/caorg/getAll"
                apiType="get" :hasCheckbox="true" style="margin-left: 14px;"></tree>
          </div>
        </div>
      </step>
    </steps>
  </div>
</template>

<script>
  import Steps from "./common/Steps.vue";
  import Step from "./common/Step.vue";
  import resourceList from "./common/resourceList.vue";
  import Tree from "./common/Tree.vue"

  export default{
    props: {
      roleId: String
    },
    data(){
      return {
        picked:"",
        current: 0,
        selectedNodesId: [],
        showResourceList: false,
        resourceListMemu: {
          api: "./restful/capermission/getByWhere",
          apiType: "post",
          type: "menu",
          selectedNodes: []
        },
        resourceListButton: {
          api: "./restful/capermission/getByWhere",
          apiType: "post",
          selectedNodes: []
        }
      }
    },
    methods: {
      next(){
        if (this.current < this.$refs.steps.$children.length - 1) {
          this.current++;
          this.$refs.steps.next();
        } else if (this.current = this.$refs.steps.$children.length - 1) {
          this.$root.Bus.$emit('toggleBtn', this.current);
          this.$refs.steps.next();
        }

        var data = this.$refs.menuList.$refs.tree.rows;
        var selected = new Array();
        var unselected = new Array();
        var buttonList = new Array();

        this.getSelectedIds(selected, data)
        this.getUnselectedIds(unselected, data);

        for (var i in this.resourceListButton.selectedNodes) {
          var node = this.resourceListButton.selectedNodes[i];

          for (var j in selected) {
            var selectNode = selected[j];

            if (selectNode.id == node.parentId) {
              buttonList.push(node);
              break;
            }
          }
        }

        this.resourceListButton.selectedNodes = buttonList;
        this.resourceListButton.hideNodes = unselected;
        this.$refs.steps.next();
      },
      prev(){
        if (this.current == 1) {
          var data = this.$refs.buttonList.$refs.tree.rows;
          var selected = new Array();
          this.getSelectedIds(selected, data);
          this.resourceListButton.selectedNodes = selected;
        }

        this.current--;
        this.$refs.steps.prev();
      },
      selected(id){
        //因后台数据需要int类型，所以在此处转换
        this.selectedNodesId.push(parseInt(id))
      },
      getSelectedIds(arr, data){
        if (data.checkStatus == "checked" || data.checkStatus == "halfChecked") {
          arr.push({
            id: data.id,
            name: data.name,
            parentId: data.parentId
          });
        }

        if (data.children && data.children.length && data.children.length > 0) {
          for (var idx in data.children) {
            this.getSelectedIds(arr, data.children[idx]);
          }
        }
      },
      getUnselectedIds(arr, data){
        if (data.checkStatus == "unchecked") {
          arr.push({
            id: data.id,
            name: data.name,
            parentId: data.parentId
          });
        }

        if (data.children && data.children.length && data.children.length > 0) {
          for (var idx in data.children) {
            this.getUnselectedIds(arr, data.children[idx]);
          }
        }
      },
      getSubmitIds(){
        var selectedMenu = new Array();
        var selectedButton = new Array();
        var keys = new Array();
        var ids = new Array();

        this.getSelectedIds(selectedMenu, this.$refs.menuList.$refs.tree.rows);

        if (this.$refs.buttonList) {
          this.getSelectedIds(selectedButton, this.$refs.buttonList.$refs.tree.rows);
        } else {
          selectedButton = this.resourceListButton.selectedNodes;
        }

        for (var i in selectedMenu) {
          var menu = selectedMenu[i];

          if (menu.id != null && menu.id != "" && typeof keys[menu.id] == "undefined") {
            keys[menu.id] = menu.id;
            ids.push(menu.id);
          }
        }

        for (var j in selectedButton) {
          var button = selectedButton[j];

          if (button.id != null && button.id != "" && typeof keys[button.id] == "undefined") {
            keys[button.id] = button.id;
            ids.push(button.id);
          }
        }

        return ids;
      }
    },
    mounted () {
      this.$http.get("./restful/capermission/findByRoleId?id=" + this.roleId).then(
        (res) => {
          var datas = res.body.content;
          var selectedMenuList = new Array();
          var selectedButtonList = new Array();

          for (var i in datas) {
            var data = datas[i];

            if (data.type == "menu") {
              selectedMenuList.push({
                id: data.id,
                name: data.name
              })
            } else if (data.type == "button") {
              selectedButtonList.push({
                id: data.id,
                name: data.name,
                parentId: data.parentId
              })
            }
          }

          this.resourceListMemu.selectedNodes = selectedMenuList;
          this.resourceListButton.selectedNodes = selectedButtonList;
          this.showResourceList = true;
        }
      )
    },
    components: {
      Steps: Steps,
      Step: Step,
      resourceList: resourceList,
      Tree: Tree
    }
  }
</script>

<style>
  .handlePrivilege {

  }
  .dataAuthority{
  width: 100%;
  height: 38px;
  line-height: 38px;
  border-bottom: 1px solid #ebebeb;
  color: #3E6481;
  font-size: 11pt;
}
.dataAuthority label{
  margin-left: 14px;
}
</style>
