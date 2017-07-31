<template>
  <div class="page-bar">
    <div class="pagebar-container">
      <ul class="pageul">
        <li style="padding-right:20px;">
          每页
          <select class="pageSizeBtn" v-model="size">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          条
        </li>
        <li>
          <a :class="setButtonClass(0)" @click="prvePage()">上一页</a>
        </li>
        <li v-for="index in indexs" :class="{ active: cur == index }">
          <a @click="btnClick(index)" v-text="index<1?'...':index">{{ index }}</a>
        </li>
        <li>
          <a :class="setButtonClass(1)" @click="nextPage()">下一页</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      currPageNum: Number,
      totalPageNum: Number,
      pageSize: Number
    },
    data(){
      return {
        cur: this.currPageNum,
        size: this.pageSize
      }
    },
    computed: {
      all(){
        return this.totalPageNum
      },
      indexs: function () {
        var left = 1;
        var right = this.all;
        var ar = [];
        if (this.all >= 11) {
          if (this.cur > 5 && this.cur < this.all - 4) {
            left = this.cur - 5
            right = this.cur + 4
          } else {
            if (this.cur <= 5) {
              left = 1
              right = 10
            } else {
              right = this.all
              left = this.all - 9
            }
          }
        }
        ;
        while (left <= right) {
          ar.push(left)
          left++
        }
        ;
        if (ar[0] > 1) {
          ar[0] = 1;
          ar[1] = -1;
        }
        ;
        if (ar[ar.length - 1] < this.all) {
          ar[ar.length - 1] = this.all;
          ar[ar.length - 2] = 0;
        }
        ;
        return ar;
      }
    },
    methods: {
      btnClick: function (pageNum) {
        if (pageNum < 1) return;
        if (pageNum != this.cur) {
          this.cur = pageNum
          //this.$dispatch('btn-click', data)
          this.$emit("paging", pageNum)
        }
      },
      nextPage: function () {
        if (this.cur >= this.all) return;
        this.btnClick(this.cur + 1);
      },
      prvePage: function () {
        if (this.cur <= 1) return;
        this.btnClick(this.cur - 1);
      },
      setButtonClass: function (isNextButton) {
        if (isNextButton) {
          return this.cur >= this.all ? "page-button-disabled" : ""
        }
        else {
          return this.cur <= 1 ? "page-button-disabled" : ""
        }
      }
    },
    watch: {
      "currPageNum": function (newVal, oldVal) {
        this.cur = newVal;
      },
      "size": function (newVal) {
        this.$emit("changePageSize", newVal)
      }
    }
  }
</script>

<style>
  .page-bar {
    margin-top: 0px;
    padding: 10px;
    width: 100%;
    height:50px;
    border-top: 1px solid #dddddd;
  }

  .pagebar-container {
    float: right;
  }

  .page-button-disabled {
    color: #ddd !important;
  }

  .page-bar .pageul li {
    display: inline-block;
    vertical-align: middle;
    color: #666;
  }

  .page-bar .pageul li:first-child > a {
    margin-left: 0px;
  }

  .page-bar .pageul a {
    border: 1px solid #ddd;
    text-decoration: none;
    position: relative;
    float: left;
    padding: 4px 12px;
    margin-left: -1px;
    line-height: 1.42857143;
    color: #08e;
    cursor: pointer;
    background: #fff;
  }

  .page-bar .pageul a:hover {
    background-color: #eee;
  }

  .page-bar .pageul .active a {
    color: #fff;
    cursor: default;
    background-color: #08e;
    border-color: #08e;
  }

  .page-bar .pageul i {
    font-style: normal;
    color: #d44950;
    margin: 0px 4px;
    font-size: 12px;
  }

  .pageSizeBtn {
    border: 1px solid #dcdcdc;
    width: 100px;
    height: 30px;
  }
</style>
