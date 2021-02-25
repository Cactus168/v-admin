<template>
  <div class="app-container">
    <el-card>
      <!-- 查询区 -->
      <div class="filter-container">
          <el-input v-model="queryParams.organName" placeholder="请输入机构名称" clearable size="small" style="width:200px;"/>
          <el-select v-model="queryParams.status" placeholder="机构状态" clearable size="small">
          </el-select>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd" v-hasAuth="['sys:organ:add']">新增</el-button>
      </div>
      <!-- 表格区 -->
      <div class="table-container">
        <el-table v-loading="loading" :data="listData" row-key="organId" border fit highlight-current-row default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column prop="organNo" label="机构编码" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="organName" label="机构名称" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="organContent" label="机构简介" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="status" label="状态" align="center" width="80">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createDate" width="180"/>
          <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasAuth="['sys:organ:edit']">修改</el-button>
              <el-button size="mini" type="success" icon="el-icon-plus" @click="handleAdd(scope.row)" v-hasAuth="['sys:organ:add']">新增</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasAuth="['sys:organ:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
   <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="上级机构">
                <treeselect 
                    v-model="form.parentId" 
                    :options="treeOptions" 
                    :normalizer="normalizer" 
                    :show-count="true" 
                placeholder="选择上级机构"/>
            </el-form-item>
            <el-form-item label="机构编号" prop="organNo">
                <el-input v-model="form.organNo" placeholder="请输入机构编号" />
            </el-form-item>
            <el-form-item label="机构名称" prop="organName">
                <el-input v-model="form.organName" placeholder="请输入机构名称" />
            </el-form-item>
            <el-form-item label="机构简介" prop="organContent">
                <el-input v-model="form.organContent" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'Organ',
  components: { Treeselect },
  data () {
    return {
      // 遮罩层
      loading: true,
      // 表格树数据
      listData: [],
      // 树行下拉框选项
      treeOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        organName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        organNo: [
          { required: true, message: '机构编号不能为空', trigger: 'blur' }
        ],
        organName: [
          { required: true, message: '机构名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.statusOptions = [{dictValue:'0',dictLabel:'启用'},{dictValue:'1',dictLabel:'停用'}]
    this.getList()
  },
  methods: {
    /** 查询菜单列表 */
    getList () {
      this.loading = true
      this.httpGet('sys/organ/',this.queryParams).then(response => {
        this.listData = this.handleTree(response.rows, "organId");
        this.loading = false
      })
    },
    /** 转换菜单数据结构 */
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
    /** 查询菜单下拉树结构 */
    getTreeselect () {
      this.treeOptions = [];
      this.httpGet('sys/organ/',this.queryParams).then(response => {
        const organ = { organId: 0, organName: '主类目', children: [] }
        organ.children = this.handleTree(response.rows, "organId");
        this.treeOptions.push(organ)
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
        organId: undefined,
        parentId: 0,
        organNo: undefined,
        organName: undefined,
        organContent: undefined,
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
      this.$confirm('确认要"' + text + '""' + row.organName + '"机构吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() =>{
          this.httpPut('sys/organ/',{ organId:row.organId, status:row.status }).then(response => {
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
      if (row != null && row.organId) {
        this.form.parentId = row.organId
      } else {
        this.form.parentId = 0
      }
      this.open = true
      this.title = '添加机构'
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset()
      this.getTreeselect()
      this.httpGet('sys/organ/'+row.organId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改机构'
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.organId != undefined) {
            this.httpPut('sys/organ/',this.form).then(response => {
              if (response) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            this.httpPost('sys/organ/',this.form).then(response => {
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
      this.$confirm('是否确认删除名称为"' + row.organName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.httpDel('sys/organ/'+row.organId).then(response => {
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
