<template>
  <div class="app-container">
      <el-row :gutter="10">
          <el-col :span="18" :xs="24">
              <el-card>
              <!-- 查询区 -->
                <div class="filter-container">
                    <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable size="small" style="width:200px;"/>
                    <el-select v-model="queryParams.status" placeholder="角色状态" clearable size="small">
                    </el-select>
                    <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
                    <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd" v-hasAuth="['sys:role:add']">新增</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete" v-hasAuth="['sys:role:remove']">删除</el-button>
                </div>
                <!-- 表格区 -->
                <div class="table-container">
                    <el-table v-loading="loading" :data="roleList" border fit highlight-current-row @selection-change="handleSelectionChange" @row-click="handleRowClick">
                        <el-table-column type="selection" width="55" align="center" />
                        <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" />
                        <el-table-column label="权限字符" prop="roleCode" :show-overflow-tooltip="true"/>
                        <el-table-column label="备注" prop="remark" width="180" />
                        <el-table-column label="状态" align="center" width="100">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.status"  active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间" align="center" prop="createDate" width="180"/>
                        <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasAuth="['sys:role:edit']">修改</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasAuth="['sys:role:remove']">删除</el-button>
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
          </el-col>
          <el-col :span="6" :xs="24">
              <el-card>
                <el-tabs v-model="activeName">
                  <el-tab-pane label="菜单权限" name="menu">
                    <el-row>
                      <el-col :span="17" :xs="24">
                        <el-tree
                          :data="menuTreeData"
                          show-checkbox
                          node-key="menuId"
                          default-expand-all
                          ref="menuTree"
                          highlight-current
                          :props="menuTreeProps">
                        </el-tree>
                      </el-col>
                      <el-col :span="7" :xs="24">
                         <el-button v-if="clickRow != null" size="small" round type="primary" icon="el-icon-share" @click="handleRoleMenus" v-hasAuth="['sys:role:add']">授权</el-button>
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane label="数据权限" name="organ">
                    <el-row>
                      <el-col :span="17" :xs="24">
                        <el-tree
                          :data="organTreeData"
                          show-checkbox
                          node-key="organId"
                          default-expand-all
                          ref="organTree"
                          highlight-current
                          :props="organTreeProps">
                        </el-tree>
                      </el-col>
                      <el-col :span="7" :xs="24">
                         <el-button v-if="clickRow != null" size="small" round type="primary" icon="el-icon-share" @click="handleRoleOrgans" v-hasAuth="['sys:role:add']">授权</el-button>
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                </el-tabs>
            </el-card>
          </el-col>
      </el-row>
      <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="form.roleName" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="权限字符" prop="roleCode">
                <el-input v-model="form.roleCode" placeholder="请输入权限字符" />
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
  name: "Role",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 被选中的行
      clickRow: null,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 选中的tab
      activeName: 'menu',
      // 菜单权限树数据
      menuTreeData: [],
      // 菜单权限树配置项
      menuTreeProps: {
        children: 'children',
        label: 'menuName'
      },
      // 数据权限树数据
      organTreeData: [],
      // 数据权限树配置项
      organTreeProps: {
        children: 'children',
        label: 'organName'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" }
        ],
        roleCode: [
          { required: true, message: "权限字符不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getMenuTreeData();
    this.getOrganTreeData();
    // this.getDicts("sys_normal_disable").then(response => {
    //   this.statusOptions = response.data;
    // });

  },
  methods: {
    /** 查询列表 */
    getList () {
      this.loading = true
      this.httpGet('sys/role/',this.queryParams).then(response => {
        this.roleList = response.rows;
          this.total = response.total;
          this.loading = false;
      })
    },
    /** 查询菜单数据 */
    getMenuTreeData () {
      this.httpGet('sys/menu/').then(response => {
         this.menuTreeData = this.handleTree(response.rows, "menuId");
      })
    },
    /** 查询机构数据 */
    getOrganTreeData () {
      this.httpGet('sys/organ/').then(response => {
         this.organTreeData = this.handleTree(response.rows, "organId");
      })
    },
    /** 点击角色获取已分配菜单权限*/
    handleRowClick(row){
      this.httpGet('sys/role/roleMenusOrgans/'+row.roleId).then(response => {
          if(response){
            this.clickRow = row;
            this.$refs.menuTree.setCheckedKeys(response.menus);
            this.$refs.organTree.setCheckedKeys(response.organs);
          }
      })
    },
    /** 给角色分配菜单权限*/
    handleRoleMenus(){
        this.$confirm('确认要为"' + this.clickRow.roleName + '"角色分配权限吗?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            const params = {};
            params.roleId = this.clickRow.roleId;
            let menuIds = this.$refs.menuTree.getCheckedKeys();
            menuIds.unshift.apply(menuIds, this.$refs.menuTree.getHalfCheckedKeys());
            params.menuIds = menuIds;
            this.httpPost('sys/role/roleMenus/',params).then(response => {
                if (response) {
                    this.msgSuccess("分配成功");
                }
            })
        }).catch(() => {});
    },
    /** 给角色分配数据访问权限*/
    handleRoleOrgans(){
        this.$confirm('确认要为"' + this.clickRow.roleName + '"角色分配权限吗?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            const params = {};
            params.roleId = this.clickRow.roleId;
            let organIds = this.$refs.organTree.getCheckedKeys();
            organIds.unshift.apply(organIds, this.$refs.organTree.getHalfCheckedKeys());
            params.organIds = organIds;
            this.httpPost('sys/role/roleOrgans/',params).then(response => {
                if (response) {
                    this.msgSuccess("分配成功");
                }
            })
        }).catch(() => {});
    },
     /** 取消按钮*/
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置*/
    reset() {
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleCode: undefined,
        roleSort: 0,
        status: "0",
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 多选框选中数据*/
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.roleId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
   /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.roleName + '"角色吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() =>{
          this.httpPut('sys/role/',{ roleId:row.roleId, status:row.status }).then(response => {
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
      this.title = '添加角色'
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset()
      this.httpGet('sys/role/'+row.roleId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改角色'
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.roleId != undefined) {
            this.httpPut('sys/role/',this.form).then(response => {
              if (response) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            this.httpPost('sys/role/',this.form).then(response => {
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
      this.$confirm('是否确认删除名称为"' + row.roleName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.httpDel('sys/role/'+row.roleId).then(response => {
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
