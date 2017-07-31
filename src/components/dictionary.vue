<template>
  <action-panel>
    <div slot="searchBar">
      <span>字典名称:</span>
      <input v-model="dicGridConfigs.searchFields.name" placeholder="请输入名称"/>
      <button type="button" @click="search">查询</button>
      <button type="button" @click="reset">重置</button>
    </div>
    <div slot="actionBar">
      <button type="button" @click="addDic">新增</button>
      <button type="button" @click="removeBatchDic">批量删除</button>
    </div>
    <div slot="actionBox">
      <tree :defaultSelectedId="defaultValue" :refresh="refresh" @refreshed="refreshed" :api="treeApi" :field="field" :expandLevel="1"
            @selected="selected"></tree>
    </div>
    <div>
      <grid :config="dicGridConfigs" ref="gridSec"></grid>
    </div>
    <!--确认控件-->
    <my-dialog v-if="dlgConfigs.show" :message="dlgConfigs.dialogMessage" @dialogCancel="dialogCancel"
               @dialogConfirm="dialogConfirm">
    </my-dialog>
    <!--新增修改界面-->
    <my-window :config="dicWindowConfigs" v-if="dicWindowConfigs.show">
      <div class="content-body-form">
        <div>
          <label>所属字典：</label>
          <tree-select :selectStyle="treeSelectConfig.selectStyle" :readonly="dicWindowConfigs.readonly"
                       v-model="dicWindowConfigs.form.parentId" :api="treeSelectConfig.api">
          </tree-select>
          <div>
          </div>
        </div>
        <div>
          <label>名称：</label>
          <input style="width:450px" maxlength="50" :readonly="dicWindowConfigs.readonly"
                 v-model="dicWindowConfigs.form.name" type="text">
        </div>
        <div>
          <label>属性：</label>
          <input style="width:450px" maxlength="50" :readonly="dicWindowConfigs.readonly"
                 v-model="dicWindowConfigs.form.dictCode" type="text">
        </div>
        <div>
          <label>备注：</label>
          <textarea :readonly="dicWindowConfigs.readonly" class="form-field"
                    v-model="dicWindowConfigs.form.remark" style="width: 450px;height: 150px;resize: none;"></textarea>
        </div>
      </div>
    </my-window>
    <!--是否成功操作提示框，无需点击-->
    <my-tooltip :show="dicTipConfigs.show" :showType="dicTipConfigs.showType" :message="dicTipConfigs.message"
                @tooltipClosed="tooltipClosed">
    </my-tooltip>
  </action-panel>
</template>


<script>
  import Tree from "./common/Tree.vue"
  import TreeSelect from "./common/TreeSelect.vue"
  import Grid from "./common/grid.vue"
  import MyDialog from "./common/Dialog.vue"
  import MyTooltip from "./common/OperationStatusTooltip.vue"
  import MyWindow from './common/Window.vue'
  import ActionPanel from "./ActionPanel.vue"

  export default {
    data() {
      return {
        treeApi: "./restful/cadic/getAll",
        refresh: false,
        dicInfoApi: "./restful/cadic/getById?id=",
        dicUpdateApi: "./restful/cadic/update",
        dicAddApi: "./restful/cadic/save",
        dicDeleteApi: "./restful/cadic/deleteById?id=",
        dicBatchDeleteApi: "./restful/cadic/batchDelete",
        defaultValue: "",
        field: "name",
        dlgConfigs: {
          show: false,
          dialogMessage: "",
          operationType: "", //区分dialog操作确认的方法
          operationItem: {},
        },
        dicWindowConfigs: {
          type: "", //add,edit;
          parent: this,
          title: "",
          height: "400px",
          width: "800px",
          show: false,
          readonly: false,
          form: {
            id: "",
            remark: "",
            name: "",
            dictCode: "",
            parentId: "",
          },
          method: {
            close() {
              this.dicWindowConfigs.show = false;
            },
            cancel() {
              this.dicWindowConfigs.show = false;
            },
            confirm() {
              this.saveform(this.dicWindowConfigs.type);
              this.dicTipConfigs.show = false;
            }
          }
        },
        dicGridConfigs: {
          searchFields: {
            name: "",
            id: "",
            parentId: "",
          },
          operations: [{
            title: "删除",
            icon: "&#xe9ac",
            func: this.removeDic,
          },
            {
              title: "编辑",
              icon: "&#xe908",
              func: this.editDic,
            },
            {
              title: "查看",
              icon: "&#xe9ce",
              func: this.viewDic
            }
          ],
          fields: [{
            title: "名称",
            field: "name",
            style: {
              float: "left",
              width: "150px",
              textAlign: "center"
            }
          },
            {
              title: "属性",
              field: "dictCode",
              style: {
                float: "left",
                width: "120px",
                textAlign: "center"
              }
            },
            {
              title: "更新日期",
              field: "createDate",
              style: {
                float: "right",
                width: "200px",
                textAlign: "center"
              }
            },
            {
              title: "更新人",
              field: "issuer",
              style: {
                float: "left",
                width: "100px",
                textAlign: "center"
              },
            },
            {
              title: "备注",
              field: "remark",
              style: {
                textAlign: "center"
              },
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: "./restful/cadic/getPage",
          //多选选中集合
          getSelectedNames: [],
          getSelectedIds: [],
        },
        dicTipConfigs: {
          show: false,
          showType: "",
          message: "",
        },
        treeSelectConfig: {
          selectStyle: {
            width: "450px",
            height: "32px",
            float: "left"
          },
          field: "name",
          api: "./restful/cadic/getAll",

        },
      }
    },
    methods: {
      search() {
        //条件查询时必须将当前页重置为1
        this.$refs.gridSec.resetCurrentPageNum();
        this.$refs.gridSec.search();
      },
      reset() {
        this.dicGridConfigs.searchFields.name = "";
        this.search();
      },
      addDic() {
        this.dicWindowConfigs.show = true;
        this.dicWindowConfigs.type = "add";
        this.dicWindowConfigs.title = "新增字典";
        this.dicWindowConfigs.form.remark="";
        this.dicWindowConfigs.form.name = "";
        this.dicWindowConfigs.form.dictCode = "";
      },
      removeBatchDic() {
        this.dicGridConfigs.getSelectedNames = [];
        this.dicGridConfigs.getSelectedIds = [];
        var selectItems = this.$refs.gridSec.getSelectedItems();
        if (selectItems.length == 0) {
          this.dicTipConfigs.show = true;
          this.dicTipConfigs.showType = "failed";
          this.dicTipConfigs.message = "请至少选中一条数据~";
          return false;
        }
        for (var i in selectItems) {
          this.dicGridConfigs.getSelectedNames.push(selectItems[i].name);
          this.dicGridConfigs.getSelectedIds.push(selectItems[i].id);
        }
        this.dlgConfigs.show = true;
        this.dlgConfigs.dialogMessage = "确认要批量删除：" + this.dicGridConfigs.getSelectedNames + "的数据吗?";
        this.dlgConfigs.operationType = "batchRemoveDic"
      },
      viewDic(item) {
        this.$http.get(this.dicInfoApi + item.id).then((res) => {
          var dicInfo = res.body.content;
          this.dicWindowConfigs.form = {
            id: dicInfo.id,
            name: dicInfo.name,
            dictCode: dicInfo.dictCode,
            remark: dicInfo.remark,
            parentId: dicInfo.parentId,
          }
          this.dicWindowConfigs.show = true;
          this.dicWindowConfigs.type = "view";
          this.dicWindowConfigs.title = "查看字典";
          this.dicWindowConfigs.readonly = true;
        })

      },
      singleRemoveDic() {
        this.$http.get(this.dicDeleteApi + this.dlgConfigs.operationItem.id).then((res) => {
          this.dicTipConfigs.showType = "success";
          this.dicTipConfigs.message = "删除成功！";
          this.dicTipConfigs.show = true;
          this.search();
        }, (res) => {
          this.dicTipConfigs.showType = "failed";
          this.dicTipConfigs.message = "删除失败！";
          this.dicTipConfigs.show = true;
        });
      },
      batchRemoveDic() {
        this.$http.post(this.dicBatchDeleteApi, this.dicGridConfigs.getSelectedIds).then((res) => {
          this.dicTipConfigs.showType = "success";
          this.dicTipConfigs.message = "删除成功！";
          this.dicTipConfigs.show = true;
          this.search();
          this.dicGridConfigs.getSelectedIds = [];
        }, (res) => {
          this.dicTipConfigs.showType = "failed";
          this.dicTipConfigs.message = "删除失败！";
          this.dicTipConfigs.show = true;
          this.dicGridConfigs.getSelectedIds = [];
        });
      },
      dialogCancel() {
        this.dlgConfigs.show = false;
      },
      dialogConfirm() {
        switch (this.dlgConfigs.operationType) {
          case "singleRemoveDic":
            this.singleRemoveDic();
            break;
          case "batchRemoveDic":
            this.batchRemoveDic();
            break;
        }
      },
      removeDic(item) {
        this.dlgConfigs.show = true;
        this.dlgConfigs.dialogMessage = "确定删除" + item.name + "吗？";
        this.dlgConfigs.operationType = "singleRemoveDic";
        this.dlgConfigs.operationItem = item;
      },
      editDic(item) {
        this.$http.get(this.dicInfoApi + item.id).then(
          (res) => {
            var dicInfo = res.body.content;
            this.dicWindowConfigs.form = {
              id: dicInfo.id,
              name: dicInfo.name,
              dictCode: dicInfo.dictCode,
              remark: dicInfo.remark,
              parentId: dicInfo.parentId,
            }
            this.dicWindowConfigs.readonly = false;
            this.dicWindowConfigs.show = true;
            this.dicWindowConfigs.type = "modify";
            this.title = "字典修改";
          }
        )
      },
      tooltipClosed() {
        this.dlgConfigs.show = false;
      },
      saveform(type) {
        var api = type == "modify" ? this.dicUpdateApi : type == "add" ? this.dicAddApi : "";
        this.$http.post(api, this.dicWindowConfigs.form).then((res) => {
            if (res.body.status == "success") {
              this.search();
              this.refresh = true;
              this.dicTipConfigs.showType = "success";
              this.dicTipConfigs.show = true;
              this.dicTipConfigs.message = "保存成功！";
              this.dicWindowConfigs.show = false;
            } else {
              this.dicTipConfigs.showType = "failed";
              this.dicTipConfigs.show = true;
              this.dicTipConfigs.message = res.body.message;
            }
          },
          (res) => {
            this.dicTipConfigs.showType = "failed";
            this.dicTipConfigs.show = true;
            this.dicTipConfigs.message = "保存失败！";
          }
        )
      },
      selected(id, title) {
        this.dicWindowConfigs.form.parentId = id;
        //点击请求机构下面存在的用户数据
        this.dicGridConfigs.searchFields.id = id;
        //将当前页重置为第一页
        this.$refs.gridSec.currPageNum = 1;
        this.$refs.gridSec.search();
      },
      refreshed(){
          this.refresh = false;
      }
    },
    components: {
      Grid: Grid,
      Tree: Tree,
      TreeSelect: TreeSelect,
      MyDialog: MyDialog,
      MyTooltip: MyTooltip,
      MyWindow: MyWindow,
      ActionPanel: ActionPanel
    }
  }
</script>

<style scoped>
  .form-field {
    width: 450px;
  }
</style>

