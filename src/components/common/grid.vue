<template>
  <div class="grid">
    <ul class="table-header">
      <li v-if="config.operations.length > 0" style="float:right;width:180px;">操作</li>
      <li style="float:left;width:30px;">#</li>
      <li v-if="config.hasCheckbox" style="float:left;width:50px;">
        <span><checkbox v-model="isCheckedAll"></checkbox></span>
      </li>
      <li v-for="fieldConfig in config.fields"
          :style="fieldConfig.style"
          @click="sort(fieldConfig)">
        <span :class="{
              sortField: fieldConfig.isSortField,
              asc: 'asc' == fieldConfig.sortType,
              desc: 'desc' == fieldConfig.sortType
            }">
          {{fieldConfig.title}}
        </span>
      </li>
    </ul>
    <template v-if="rows.length > 0">
      <ul v-for="(r,index) in rows" @click="selectRow(r)"
          class="table-row" :class="{'selected':r.isChecked}">
        <li v-if="config.operations.length > 0" style="float:right;width:180px;text-align:center;">
            <span v-if="$permissionValid(operation.permission)" v-for="operation in config.operations" class="operation"
                  @click.stop="operation.func(r)" :title="operation.title" v-html="operation.icon">
            </span>
        </li>
        <li style="width:30px;float:left;text-align:center;">{{index + 1}}</li>
        <li v-if="config.hasCheckbox" style="width:50px;float:left;text-align:center;">
          <checkbox v-model="r.isChecked" @change="checkStatusChange(r)"></checkbox>
        </li>
        <li v-for="fieldConfig in config.fields" :style="fieldConfig.style">
          <div v-if="getFieldValue(r,fieldConfig.field) == '' || getFieldValue(r,fieldConfig.field) == undefined">
            &nbsp;
          </div>
          <span v-else :title="r[fieldConfig.field]">{{getFieldValue(r,fieldConfig.field)}}</span>
        </li>
      </ul>
    </template>
    <template v-else>
      <ul>
        <li>
          <div style="line-height:200px;text-align: center;vertical-align: middle;">&nbsp;{{message}}&nbsp;</div>
        </li>
      </ul>
    </template>

    <pagination @paging="paging" @changePageSize="changePageSize"
                :currPageNum="currPageNum" :totalPageNum="totalPageNum"
                :pageSize="pageSize"/>
    <wait-mask :isShow="showMask" :maskByParent="config.maskByParent"></wait-mask>
  </div>
</template>

<script>
  import pagination from "./pagination.vue";
  import WaitMask from "./WaitMask.vue";
  import Checkbox from "./Checkbox.vue"

  export default{
    props: {
      config: Object
    },
    data(){
      if (typeof this.config == "undefined") {
        throw "组件的config属性未配置"
      }

      //未设置操作列时将默认设置为空数组
      if (typeof this.config.operations == "undefined") {
        this.config.operations = new Array();
      }

      if (typeof this.config.maskByParent == "undefined") {
        this.config.maskByParent = false;
      }

      if (typeof this.config.hasCheckbox == "undefined") {
        this.config.hasCheckbox = true;
      }

      if (typeof this.config.selectedIds == "undefined") {
        this.config.selectedIds = new Array();
      }

      var selectedMap = new Array();

      for (var i in this.config.selectedIds) {
        var id = this.config.selectedIds[i];
        selectedMap[id] = id;
      }

      return {
        message: "",
        isCheckedAll: false,
        rows: {},
        currPageNum: this.config.currPageNum,
        totalPageNum: this.config.totalPageNum,
        pageSize: this.config.pageSize,
        showMask: true,
        selectedMap: selectedMap
      }
    },
    methods: {
      paging(pageNum){
        this.currPageNum = pageNum;
        this.search();
      },
      changePageSize(pageSize){
        //修改每页多少条记录时需要将当前页重置为1
        this.currPageNum = 1;
        this.pageSize = parseInt(pageSize);
        this.search();
      },
      sort(fieldConfig){
        //允许进行排序的字段上点击才进排序操作
        if (fieldConfig.isSortField) {
          var sortType = fieldConfig.sortType
          var fields = this.config.fields;

          for (var idx in fields) {
            fields[idx].sortType = ""
          }

          if ("asc" == sortType) {
            fieldConfig.sortType = "desc";
          } else {
            fieldConfig.sortType = "asc";
          }

          //排序时将当前页设置为第一页进行显示
          this.currPageNum = 1;
          this.search();
        }
      },
      search(){
        this.message = "查询中．．．";
        this.showMask = true;
        var fields = this.config.fields;
        var orderFields = new Array();
        var conditions = this.config.searchFields;

        //未设置查询条件则重置为空对象
        if (!conditions) {
          conditions = {}
        }

        for (var idx in fields) {
          if (fields[idx].isSortField === true) {
            if (fields[idx].sortType != "") {
              var orderBy = fields[idx].orderBy;

              // 未指定orderby字段时直接使用field字段做为排序字段
              if (typeof orderBy == "undefined" || orderBy == "" || orderBy == null) {
                orderBy = fields[idx].field;
              }

              orderFields.push({
                field: orderBy,
                sortType: fields[idx].sortType
              })
            }
          }
        }
        this.$http.post(this.config.api, {
          "pageSize": this.pageSize,
          "pageNumber": this.currPageNum,
          "orderFields": orderFields,
          "conditions": conditions
        }).then(
          (res) => {
            this.showMask = false;
            this.totalPageNum = res.body.content.totalPageNum;
            var rows = res.body.content.rows;

            //初始化未选择状态
            for (var idx in rows) {
              var row = rows[idx];

              if (typeof this.selectedMap[row.id] != "undefined" && this.selectedMap[row.id] != null) {
                row.isChecked = true;
              } else {
                row.isChecked = false;
              }
            }

            this.rows = res.body.content.rows;

            /*
             * 判断是否定义的查询后的回调函数
             */
            if (typeof this.config.searchedCallback != "undefined") {
              //执行回调函数, 这样允许使用组件方可以对查调结果进行自定义处理
              this.config.searchedCallback(this.rows);
            }

            if (this.rows.length < 1) {
              this.message = "未查找到相关记录！";
            }
          }
        )
      },
      selectRow(row){
        if (this.config.hasCheckbox) {

          row.isChecked = !row.isChecked;

          if (row.isChecked) {
            this.selectedMap[row.id] = row.id;
          } else {
            this.selectedMap[row.id] = null;
          }
        } else {
          for (var i in this.rows) {
            var r = this.rows[i];
            r.isChecked = false;
          }

          row.isChecked = true;
          this.$emit('selected', row);
        }
      },
      checkStatusChange(row){
        if (row.isChecked) {
          this.selectedMap[row.id] = row.id;
        } else {
          this.selectedMap[row.id] = null;
        }
      },
      resetCurrentPageNum(){
        this.currPageNum = 1;
      },
      getSelectedItems(){
        var selectedRows = new Array();

        for (var idx in this.rows) {
          var row = this.rows[idx];

          if (row.isChecked) {
            selectedRows.push(row);
          }
        }

        return selectedRows;
      },
      getFieldValue(row, field){
        var fields = field.split(".");
        var value = row;
        for (var i in fields) {
          value = value[fields[i]];
        }

        return value;
      }
    },
    created(){
      var fields = this.config.fields;
      for (var idx in fields) {
        if (typeof fields[idx].sortType == "undefined") {
          this.$set(fields[idx], "sortType", "")
        }
      }
    },
    mounted(){
      this.search();
    },
    components: {
      pagination: pagination,
      WaitMask: WaitMask,
      Checkbox: Checkbox
    },
    watch: {
      "isCheckedAll": function (newValue) {
        for (var idx in this.rows) {
          var row = this.rows[idx];
          row.isChecked = newValue;

          if (row.isChecked) {
            this.selectedMap[row.id] = row.id;
          } else {
            this.selectedMap[row.id] = null;
          }
        }
      }
    }
  }
</script>

<style scoped>
  .grid {
    font-family: iconfont;
  }

  .table-header {
    line-height: 40px;
    height: 41px;
    clear: both;
    border-bottom: 1px solid #dddddd;
  }

  .table-header li {
    text-align: center;
    cursor: default;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .table-header > li > span:hover {
    background-color: rgba(222, 233, 246, 0.8);
    border-radius: 4px;
    padding: 5px 5px;
    border: 1px solid #dddddd;
  }

  .table-row {
    height: 40px;
    line-height: 38px;
    clear: both;
    border-top: 1px solid #dddddd;
  }

  .table-row:hover {
    background-color: #f7f7f7;
  }

  .table-row li {
    height: 100%;
    cursor: default;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .sortField {
    cursor: default;
  }

  .asc:after {
    content: '\ea3a';
    font-size: 16px;
  }

  .desc:after {
    content: '\ea3e';
    font-size: 16px;
  }

  .operation {
    padding: 8px;
  }

  .operation:hover {
    background-color: #cccccc;
    color: #0374d0;
  }

  .grid .selected {
    background-color: #ffefbb;
  }

  .grid .selected:hover {
    background-color: #ffefbb;
  }
</style>
