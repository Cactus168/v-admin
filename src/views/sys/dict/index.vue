<template>
  <div class="app-container">
        <el-card>
            <!-- 查询区 -->
            <div class="filter-container">
                <el-input v-model="queryParams.dictName" placeholder="请类型名称" clearable size="small" style="width:200px;"/>
                <el-select v-model="queryParams.status" placeholder="类型状态" clearable size="small">
                </el-select>
                <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
                <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd" v-hasAuth="['sys:dict:add']">新增</el-button>
            </div>
            <!-- 表格区 -->
            <div class="table-container">
                <el-table v-loading="loading" :data="dictTypeList" border fit highlight-current-row>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-table v-loading="loading" :data="props.row.dictDatas" border fit highlight-current-row>
                                <el-table-column label="编码code" prop="dictKey" :show-overflow-tooltip="true" width="200" />
                                <el-table-column label="编码名称" prop="dictLabel" :show-overflow-tooltip="true"/>
                                <el-table-column label="显示顺序" prop="orderNum" align="center" width="100" />
                                <el-table-column label="状态" align="center" width="100">
                                    <template slot-scope="scope">
                                        <el-switch v-model="scope.row.status"  active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
                                    <template slot-scope="scope">
                                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasAuth="['sys:dict:edit']">修改</el-button>
                                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasAuth="['sys:dict:remove']">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>
                    <el-table-column label="类型code" prop="dictNo" :show-overflow-tooltip="true" width="200" />
                    <el-table-column label="类型名称" prop="dictName" :show-overflow-tooltip="true"/>
                    <el-table-column label="类型备注" prop="remark" :show-overflow-tooltip="true"/>
                    <el-table-column label="状态" align="center" width="100">
                        <template slot-scope="scope">
                            <el-switch v-model="scope.row.status"  active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
                        <template slot-scope="scope">
                            <el-button size="mini" type="success" icon="el-icon-plus" @click="handleAdd(scope.row)" v-hasAuth="['sys:dict:add']">新增</el-button>
                            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasAuth="['sys:dict:edit']">修改</el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasAuth="['sys:dict:remove']">删除</el-button>
                        </template>
                    </el-table-column>
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
        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="类型code" v-if="isDictType" prop="dictNo">
                    <el-input v-model="form.dictNo" placeholder="请输入类型code" />
                </el-form-item>
                <el-form-item label="类型名称" v-if="isDictType" prop="dictName">
                    <el-input v-model="form.dictName" placeholder="请输入类型名称" />
                </el-form-item>
                <el-form-item label="编码code" v-if="!isDictType" prop="dictKey">
                    <el-input v-model="form.dictKey" placeholder="请输入编码code" />
                </el-form-item>
                <el-form-item label="编码名称" v-if="!isDictType" prop="dictLabel">
                    <el-input v-model="form.dictLabel" placeholder="请输入编码名称" />
                </el-form-item>
                <el-form-item label="备注" v-if="isDictType" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item label="显示排序" v-if="!isDictType" prop="orderNum">
                    <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script type="text/javascript">
export default {
  name: "Dict",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否为字典类型
      isDictType: true,
      // 字典类型数据
      dictTypeList: [],
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictNo: [
          { required: true, message: "类型code不能为空", trigger: "blur" }
        ],
        dictName: [
          { required: true, message: "类型名称不能为空", trigger: "blur" }
        ],
        dictKey: [
          { required: true, message: "编码code不能为空", trigger: "blur" }
        ],
        dictLabel: [
          { required: true, message: "编码名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示顺序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList () {
      this.loading = true
      this.httpGet('sys/dict/',this.queryParams).then(response => {
          this.dictTypeList = response.rows;
          this.total = response.total;
          this.loading = false;
      })
    },
     /** 取消按钮*/
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置*/
    reset() {
      this.form = {
        dictId: undefined,
        parentId: 0,
        dictNo: undefined,
        dictName: undefined,
        dictKey: undefined,
        dictLabel: undefined,
        orderNum: 0,
        status: "0",
        remark: undefined
      };
      this.resetForm("form");
    },
   /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      let msgText = row.parentId === 0 ? row.dictName : row.dictValue;
      this.$confirm('确认要"' + text + '""' + msgText + '"字典吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() =>{
          this.httpPut('sys/dict/',{ dictId:row.dictId, status:row.status }).then(response => {
              if (response) {
                this.msgSuccess('修改成功')
              }
          })
        }).catch(() =>{row.status = row.status === "0" ? "1" : "0";});
    },
     /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd (row) {
      this.reset()
      this.open = true
      if(row.dictId){
        this.isDictType = false;
        this.form.parentId = row.dictId;
        this.title = '添加字典编码'
      }else{
        this.form.parentId = 0;
        this.isDictType = true;
        this.title = '添加字典类型'
      }
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset()
      this.httpGet('sys/dict/'+row.dictId).then(response => {
        this.form = response.data
        this.open = true
        this.title = row.parentId === 0 ? '修改字典类型' : '修改字典编码'
        this.isDictType = row.parentId === 0;
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.dictId != undefined) {
            this.httpPut('sys/dict/',this.form).then(response => {
              if (response) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            this.httpPost('sys/dict/',this.form).then(response => {
              if (response) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      let flag = true;
      let msgText = row.dictValue;
      if(row.parentId == 0){
        msgText = row.dictName;
        if(row.dictDatas.length > 0){
            flag = false;
        }
      }
      if(flag){
        this.$confirm('是否确认删除名称为"' + msgText + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.httpDel('sys/dict/'+row.dictId).then(response => {
            if (response) {
              this.getList();
              this.msgSuccess("删除成功");
            }
          })
        }).catch(() => {});
      }else{
          this.msgSuccess('请先删除"' + msgText + '"的子数据项?')
      }
    }
  }
}
</script>
<style scoped>

</style>