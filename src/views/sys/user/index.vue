<template>
  <div class="app-container">
      <el-card>
          <!-- 查询区 -->
          <div class="filter-container">
              <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable size="small" style="width:200px;"/>
              <el-select v-model="queryParams.status" placeholder="状态" clearable size="small">
              </el-select>
              <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
              <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd" v-hasAuth="['sys:user:add']">新增</el-button>
              <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete" v-hasAuth="['sys:user:remove']">删除</el-button>
          </div>
          <!-- 表格区 -->
          <div class="table-container">
              <el-table v-loading="loading" :data="listData" border fit highlight-current-row @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55" align="center" />
                  <el-table-column label="帐号" prop="username" :show-overflow-tooltip="true" />
                  <el-table-column label="名称" prop="realName" :show-overflow-tooltip="true"/>
                  <el-table-column label="部门" prop="organName" />
                  <el-table-column label="性别" prop="sex" align="center" width="80">
                    <template slot-scope="scope">
                      <el-tag v-if="scope.row.sex === '0'" size="small">男</el-tag>
                      <el-tag v-else-if="scope.row.sex === '1'" size="small" type="success">女</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="手机号码" align="center" prop="phoneNum" width="120"/>
                  <el-table-column label="邮箱" align="center" prop="email" width="180"/>
                  <el-table-column label="状态" align="center" width="100">
                      <template slot-scope="scope">
                          <el-switch :disabled="scope.row.username == 'admin'" v-model="scope.row.status"  active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
                      </template>
                  </el-table-column>
                  <el-table-column label="创建时间" align="center" sortable prop="createDate" width="180"/>
                  <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
                      <template slot-scope="scope">
                          <el-button :disabled="scope.row.username == 'admin'" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasAuth="['sys:role:edit']">修改</el-button>
                          <el-button :disabled="scope.row.username == 'admin'" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasAuth="['sys:role:remove']">删除</el-button>
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
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="用户名称" prop="realName">
                  <el-input v-model="form.realName" placeholder="请输入用户名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="归属机构" prop="organId">
                  <treeselect v-model="form.organId" :options="organOptions" :normalizer="normalizer" :disable-branch-nodes="true" :show-count="true" placeholder="请选择归属机构" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item v-if="form.userId == undefined" label="用户帐号" prop="username">
                  <el-input v-model="form.username" placeholder="请输入用户帐号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
                  <el-input v-model="form.password" placeholder="请输入用户密码" type="password" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="手机号码" prop="phoneNum">
                  <el-input v-model="form.phoneNum" placeholder="请输入手机号码" maxlength="11" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电子邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-select v-model="form.sex" placeholder="请选择">
                    <el-option
                      v-for="dict in sexOptions"
                      :key="dict.dictValue"
                      :label="dict.dictLabel"
                      :value="dict.dictValue"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色" prop="roleIds">
                  <el-select v-model="form.roleIds" multiple placeholder="请选择">
                    <el-option
                      v-for="item in roleOptions"
                      :key="item.roleId"
                      :label="item.roleName"
                      :value="item.roleId"
                      :disabled="item.status == 1"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="住址">
                  <el-input v-model="form.address" type="textarea" placeholder="请输入住址"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
          </div>
      </el-dialog>
    </div>
</template>
<script type="text/javascript">
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "User",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 角色表格数据
      listData: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 机构数据
      organOptions: [],
      // 角色数据
      roleOptions: [],
      // 性别数据
      sexOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        organId: [
          { required: true, message: "组织机构不能为空", trigger: "blur" }
        ],
        username: [
          { required: true, message: "用户帐号不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" }
        ],
        realName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" }
        ],
        roleIds: [
          { required: true, message: "角色不能为空", trigger: "blur" }
        ],
        phoneNum: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.sexOptions = [{dictValue:'0',dictLabel:'男'},{dictValue:'1',dictLabel:'女'}]
  },
  methods: {
    /** 查询列表 */
    getList () {
      this.loading = true
      this.httpGet('sys/user/',this.queryParams).then(response => {
          this.listData = response.rows;
          this.total = response.total;
          this.loading = false;
      })
    },
    /** 查询角色数据 */
    getRoleData () {
      this.httpGet('sys/role/').then(response => {
         this.roleOptions = response.rows;
      })
    },
    /** 查询机构数据 */
    getOrganTreeData () {
      this.httpGet('sys/organ/').then(response => {
         this.organOptions = this.handleTree(response.rows, "organId");
      })
    },
    /** 转换机构数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.organId,
        label: node.organName,
        children: node.children
      }
    },
     /** 取消按钮*/
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置*/
    reset() {
      this.form = {
        userId: undefined,
        organId: undefined,
        username: undefined,
        realName: undefined,
        sex: "0",
        phoneNum: undefined,
        email: undefined,
        address: undefined,
        status: "0",
        roleIds: []
      };
      this.resetForm("form");
    },
    /** 多选框选中数据*/
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
   /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.username + '"用户吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() =>{
          this.httpPut('sys/user/',{ userId:row.userId, status:row.status }).then(response => {
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
      this.getRoleData();
      this.getOrganTreeData();
      this.httpGet('sys/user/pw').then(response => {
        this.form.password = response.data;
        this.open = true
        this.title = '添加用户'
      })
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset()
      this.getRoleData();
      this.getOrganTreeData();
      this.httpGet('sys/user/'+row.userId).then(response => {
        this.form = response.data
        this.form.roleIds = response.roleIds
        this.open = true
        this.title = '修改用户'
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      console.log(this.form)
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.userId != undefined) {
            this.httpPut('sys/user/',this.form).then(response => {
              if (response) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            this.httpPost('sys/user/',this.form).then(response => {
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
      this.$confirm('是否确认删除名称为"' + row.username + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.httpDel('sys/user/'+row.userId).then(response => {
          if (response) {
            this.getList();
            this.msgSuccess("删除成功");
          }
        })
      }).catch(() => {});
    }
  }
}
</script>