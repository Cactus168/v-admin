<template>
  <div class="app-container">
      <el-card>
        <!-- 查询区 -->
        <div class="filter-container">
            <el-input v-model="queryParams.userName" placeholder="请输入用户" clearable size="small" style="width:200px;"/>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              align="right"
              size="small"
              unlink-panels
              range-separator="至"
              start-placeholder="登录开始日期"
              end-placeholder="登录结束日期"
              :picker-options="pickerOptions">
            </el-date-picker>
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        </div>
        <!-- 表格区 -->
        <div class="table-container">
            <el-table v-loading="loading" :data="listData" border fit highlight-current-row>
              <el-table-column label="用户名称" align="center" prop="userName" />
              <el-table-column label="登录地址" align="center" prop="ipaddr" width="130" :show-overflow-tooltip="true" />
              <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
              <el-table-column label="浏览器" align="center" prop="browser" />
              <el-table-column label="操作系统" align="center" prop="loginOs" />
              <el-table-column label="登录日期" align="center" prop="loginTime" width="180"/>
            </el-table>
        </div>
        <!-- 分页区 -->
        <div class="pagination-container">
            <pagination
                v-show="total>0"
                :total="total"
                :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
        </div>
      </el-card>
  </div>
</template>
<script>
export default {
  name: "Logininfor",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 表格数据
      listData: [],
      // 状态数据字典
      statusOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: undefined,
		    endTime: undefined,
        userName: undefined
      },
      pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        }
    };
  },
  created() {
    this.getList();;
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = false;
      const params = this.queryParams;
      params.beginTime = undefined;
      params.endTime = undefined;
      if (null != this.dateRange && '' != this.dateRange) {
        params.beginTime = this.dateRange[0];
        params.endTime = this.dateRange[1];
      }
      this.httpGet('sys/log/login/',params).then(response => {
          this.listData = response.rows;
          this.total = response.total;
          this.loading = false;
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有操作日志数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportLogininfor(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>