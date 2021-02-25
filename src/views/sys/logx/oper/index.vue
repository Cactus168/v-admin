<template>
  <div class="app-container">
      <el-card>
        <!-- 查询区 -->
        <div class="filter-container">
            <el-input v-model="queryParams.moduleName" placeholder="请输入功能模块" clearable size="small" style="width:150px;"/>
            <el-input v-model="queryParams.operateType" placeholder="请输入操作类型" clearable size="small" style="width:150px;"/>
            <el-input v-model="queryParams.operName" placeholder="请输入操作人员" clearable size="small" style="width:150px;"/>
            <el-select
                v-model="queryParams.status"
                placeholder="操作状态"
                clearable
                size="small"
                style="width: 150px"
              >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictKey"
                :label="dict.dictLabel"
                :value="dict.dictKey"
              />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              align="right"
              size="small"
              unlink-panels
              range-separator="至"
              start-placeholder="操作开始日期"
              end-placeholder="操作结束日期"
              :picker-options="pickerOptions">
            </el-date-picker>
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
        </div>
        <!-- 表格区 -->
        <div class="table-container">
            <el-table v-loading="loading" :data="listData" border fit highlight-current-row>
              <el-table-column type="expand">
                <template slot-scope="props">
                  <table class="gridtable" style="width:100%">
                    <tr>
                      <td width="100px;"><label>操作模块：</label></td>
                      <td>{{ props.row.moduleName }} / {{ props.row.operateType }}</td>
                      <td width="100px;"><label>请求地址：</label></td>
                      <td>{{ props.row.operUrl }}</td>
                      <td width="100px;"><label>请求方式：</label></td>
                      <td>{{ props.row.requestMethod }}</td>
                      <td width="100px;"><label>操作状态：</label></td>
                      <td>
                        <el-tag v-if="props.row.status === '0'" size="small" type="success">成功</el-tag>
                        <el-tag v-else-if="props.row.status === '1'" size="small" type="danger">失败</el-tag>
                      </td>
                      <td width="100px;"><label>操作时间：</label></td>
                      <td>{{ props.row.operTime }}</td>
                    </tr>
                    <tr>
                      <td><label>操作方法：</label></td>
                      <td colspan="9">{{ props.row.method }}</td>
                    </tr>
                    <tr>
                      <td><label>请求参数：</label></td>
                      <td colspan="9">{{ props.row.operParam }}</td>
                    </tr>
                    <tr>
                      <td><label>返回参数：</label></td>
                      <td colspan="9">{{ props.row.jsonResult }}</td>
                    </tr>
                    <tr v-if="props.row.status != 0">
                      <td><label>异常信息：</label></td>
                      <td colspan="9">{{ props.row.errorMsg }}</td>
                    </tr>
                  </table>
                </template>
              </el-table-column>
              <el-table-column label="系统模块" align="center" prop="moduleName" />
              <el-table-column label="操作类型" align="center" prop="operateType"/>
              <el-table-column label="请求方式" align="center" prop="requestMethod" />
              <el-table-column label="操作人员" align="center" prop="operName" />
              <el-table-column label="主机" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
              <el-table-column label="操作地点" align="center" prop="operLocation" :show-overflow-tooltip="true" />
              <el-table-column label="操作状态" align="center" prop="status" >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status === '0'" size="small" type="success">成功</el-tag>
                  <el-tag v-else-if="scope.row.status === '1'" size="small" type="danger">失败</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作日期" align="center" prop="operTime" width="180"/>
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
        operateType: undefined,
        moduleName: undefined,
        operName: undefined
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
    this.getList();
    this.getDicts("oper_status").then(response => {
      this.statusOptions = response.data;
    });
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
      this.httpGet('sys/log/oper/',params).then(response => {
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