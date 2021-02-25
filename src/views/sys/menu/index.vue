<template>
  <div class="app-container">
    <el-card>
      <!-- 查询区 -->
      <div class="filter-container">
          <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable size="small" style="width:200px;"/>
          <el-select v-model="queryParams.status" placeholder="菜单状态" clearable size="small">
          </el-select>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd" v-hasAuth="['sys:menu:add']">新增</el-button>
      </div>
      <!-- 表格区 -->
      <div class="table-container">
        <el-table v-loading="loading" :data="menuList" row-key="menuId" border fit highlight-current-row :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
          <el-table-column prop="menuType" label="菜单类型" align="center" width="80">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.menuType === 'M'" size="small">目录</el-tag>
              <el-tag v-else-if="scope.row.menuType === 'C'" size="small" type="success">菜单</el-tag>
              <el-tag v-else-if="scope.row.menuType === 'F'" size="small" type="info">按钮</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="icon" label="图标" align="center" width="100">
            <template slot-scope="scope">
              <svg-icon :icon-class="scope.row.icon" />
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路由地址" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="orderNum" sortable label="排序" width="80"></el-table-column>
          <el-table-column prop="status" label="状态" align="center" width="80">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasAuth="['sys:menu:edit']">修改</el-button>
              <el-button size="mini" type="success" v-if="scope.row.menuType != 'F'" icon="el-icon-plus" @click="handleAdd(scope.row)" v-hasAuth="['sys:menu:add']">新增</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasAuth="['sys:menu:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
   <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <treeselect v-model="form.parentId" :options="menuOptions" :normalizer="normalizer" :show-count="true" placeholder="选择上级菜单"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="菜单图标">
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()" >
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly></el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.menuType != 'F'?'菜单名称':'按钮名称'" prop="menuName">
              <el-input v-model="form.menuName" :placeholder="form.menuType != 'F'?'请输入菜单名称':'请输入按钮名称'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="是否显示">
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in visibleOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="是否外链">
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" label="路由地址" prop="path">
              <el-input v-model="form.path" placeholder="请输入路由地址,格式：aaa" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径,格式：aaa/bbb" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType == 'F'" label="权限标识">
              <el-input v-model="form.perms" placeholder="请权限标识，格式：aaa:bbb:add" maxlength="50" />
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

<script>
import IconSelect from "@/components/IconSelect";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'Menu',
  components: { Treeselect, IconSelect },
  data () {
    return {
      // 遮罩层
      loading: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 显示状态数据字典
      visibleOptions: [],
      // 菜单状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        menuName: undefined,
        visible: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ],
        orderNum: [
          { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '路由地址不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.visibleOptions = [{dictValue:'0',dictLabel:'显示'},{dictValue:'1',dictLabel:'隐藏'}]
    this.statusOptions = [{dictValue:'0',dictLabel:'启用'},{dictValue:'1',dictLabel:'停用'}]
    this.getList()
  },
  methods: {
    // 选择图标
    selected (name) {
      this.form.icon = name
    },
    /** 查询菜单列表 */
    getList () {
      this.loading = true
      this.httpGet('sys/menu/',this.queryParams).then(response => {
        this.menuList = this.handleTree(response.rows, "menuId");
        this.loading = false
      })
    },
    /** 转换菜单数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      }
    },
    /** 查询菜单下拉树结构 */
    getTreeselect () {
      this.menuOptions = [];
      this.httpGet('sys/menu/',this.queryParams).then(response => {
        const menu = { menuId: 0, menuName: '主类目', children: [] }
        const treeData = response.rows.filter(item => {
          return item.menuType != 'F';
        });
        menu.children = this.handleTree(treeData, "menuId");
        this.menuOptions.push(menu)
      })
    },
    // 取消按钮
    cancel () {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset () {
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: 'M',
        orderNum: 1,
        isFrame: '1',
        visible: '0',
        status: '0'
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.getList()
    },
    /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.menuName + '"菜单吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() =>{
          this.httpPut('sys/menu/',{ menuId:row.menuId, status:row.status }).then(response => {
              if (response) {
                this.msgSuccess('修改成功')
              }
          })
        }).catch(() =>{row.status = row.status === "0" ? "1" : "0";});
    },
    /** 新增按钮操作 */
    handleAdd (row) {
      this.reset()
      this.getTreeselect()
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId
      } else {
        this.form.parentId = 0
      }
      this.open = true
      this.title = '添加菜单'
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset()
      this.getTreeselect()
      this.httpGet('sys/menu/'+row.menuId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改菜单'
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.menuId != undefined) {
            this.httpPut('sys/menu/',this.form).then(response => {
              if (response) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            this.httpPost('sys/menu/',this.form).then(response => {
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
      this.$confirm('是否确认删除名称为"' + row.menuName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.httpDel('sys/menu/'+row.menuId).then(response => {
          if (response) {
            this.getList();
            this.msgSuccess("删除成功");
          }
        })
      }).catch(() => {});
    }
  }
};
</script>
