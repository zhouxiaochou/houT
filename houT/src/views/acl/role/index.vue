<template>
  <el-card>
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="角色名称" v-model="searchName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button @click="searchName = null">清空</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" @click="addDialogVisible = true">添加</el-button>
    <el-button type="danger" disabled>批量删除</el-button>

    <!-- @selection-change="handleSelectionChange" -->
    <el-table
      ref="multipleTable"
      tooltip-effect="dark"
      style="width: 75%; margin-top: 20px"
      border
      :data="records"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column label="序号" type="index" align="center" width="120">
      </el-table-column>
      <el-table-column label="角色名称" align="center" prop="roleName">
        <template slot-scope="{ row }">
          <div v-if="row.isEdit">
            <el-input
              v-model="row.editRoleName"
              style="width: 70%"
              size="mini"
            ></el-input>
            <el-button
              type="warning"
              icon="el-icon-refresh"
              size="mini"
              style="float: right"
              @click="cancelEditRoleName(row)"
              >取消</el-button
            >
          </div>
          <span v-else>{{row.roleName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300">
        <template slot-scope="{ row }">
          <el-tooltip effect="dark" content="分配权限" placement="top-start">
            <el-button type="info" icon="el-icon-info" size="mini" @click="goAuth(row)"></el-button>
          </el-tooltip>

          <el-tooltip
            v-if="row.isEdit"
            effect="dark"
            content="确定"
            placement="top-start"
          >
            <el-button
              type="primary"
              icon="el-icon-check"
              size="mini"
              @click="checkEditRole(row)"
            ></el-button>
          </el-tooltip>

          <el-tooltip
            v-else
            effect="dark"
            content="修改角色"
            placement="top-start"
          >
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRole(row)"
            ></el-button>
          </el-tooltip>

          <el-tooltip
            effect="dark"
            content="删除角色"
            style="margin-left: 10px"
            placement="top-start"
          >
            <el-popconfirm
              :title="`确定要删除${row.roleName}吗？`"
              @onConfirm="deleteRole(row)"
            >
              <el-button
                slot="reference"
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </el-popconfirm>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- dialog -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%">
      <el-form :model="roleForm">
        <el-form-item label="请输入新的名称:">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="cancelAddRole">取消</el-button>
        <el-button type="primary" @click="addRole">确定</el-button>
      </span>
    </el-dialog>

    <!-- pagination -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="limit"
      style="text-align: center"
      layout=" prev, pager, next, jumper, ->, sizes, total"
      :total="total"
    >
    </el-pagination>
  </el-card>
</template>

<script>
export default {
  name: "Role",
  data() {
    return {
      page: 1,
      limit: 10,
      total: 1,
      records: [], //当前页所展示的角色列表
      loading: false,
      roleForm: {}, //收集添加角色的名字
      searchName:null,//搜索角色名称
      addDialogVisible: false,
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    // 重置数据
    resetData() {
      this.roleForm = {};
    },

    // 搜索角色
    search(){
      let searchObj = {
        roleName:this.searchName
      }
      this.getPageList(searchObj)
    },
    // 编辑角色
    editRole(role) {
      this.$set(role,'editRoleName',role.roleName)
      if (role.hasOwnProperty("isEdit")) {
        role.isEdit = true;
      } else {
        this.$set(role, "isEdit", true);
      }
    },
    // 确认编辑
    async checkEditRole(role) {
      role.isEdit = false;
      const {id,editRoleName} = role
      let roleObj = {
        id,
        roleName:editRoleName
      }
      try {
        await this.$API.role.updateById(roleObj)
        role.roleName = role.editRoleName
        this.$message.success('编辑成功！')
      } catch (error) {}
    },
    // 取消编辑
    cancelEditRoleName(role){
      role.isEdit = false;
      this.$message.warning('已取消编辑！')
    },

    // 添加角色
    async addRole() {
      await this.$API.role.save(this.roleForm);
      try {
        this.$message.success("添加成功");
        this.addDialogVisible = false;
        this.getPageList();
        this.resetData();
      } catch (error) {}
    },
    // 取消添加角色
    cancelAddRole() {
      this.addDialogVisible = false;
      this.$message.warning("已取消添加");
    },

    // 删除角色
    async deleteRole(role) {
      await this.$API.role.removeById(role.id);
      this.$message.success("删除成功");
      this.getPageList();
    },

    //  * 分页所需要的函数
    async getPageList(searchObj) {
      this.loading = true;
      const result = await this.$API.role.getPageList(this.page, this.limit,searchObj);
      this.total = result.data.total;
      this.records = result.data.items;
      this.loading = false;
    },
    // 当前页所展示的数量
    handleSizeChange(val) {
      this.limit = val;
      this.getPageList();
    },
    // 当前页
    handleCurrentChange(val) {
      this.page = val;
      this.getPageList();
    },

    // 点击路由跳转
    goAuth(role){
      let roleName = role.roleName
      let id = role.id
      this.$router.push({
        path:'role/authority',
        query:{roleName,id}
      })
    }
  },
};
</script>

<style></style>
