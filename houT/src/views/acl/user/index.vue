<template>
  <div>
    <el-card>
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="用户名" v-model="searchObj.username"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchUsers">查询</el-button>
          <el-button type="info" @click="cleanSearch">清空</el-button>
        </el-form-item>
      </el-form>

      <el-button type="primary" @click="addUserDialogVisible = true">添加</el-button>
      <el-button
        type="danger"
        :disabled="!selectedID.length > 0"
        @click="removeId"
        >批量删除</el-button
      >

      <el-table
        :data="records"
        ref="multipleTable"
        tooltip-effect="dark"
        style="width: 100%; margin-top: 20px"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="序号" type="index" width="80" align="center">
          <!-- <template slot-scope="scope">{{ scope.row.date }}</template> -->
        </el-table-column>
        <el-table-column label="用户名" prop="username"> </el-table-column>
        <!--  show-overflow-tooltip -->
        <el-table-column label="用户昵称" prop="nickName"> </el-table-column>
        <el-table-column label="权限列表" prop="roleName"> </el-table-column>
        <el-table-column label="创建时间" prop="gmtCreate"> </el-table-column>
        <el-table-column label="更新时间" prop="gmtModified"> </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{ row }">
            <el-tooltip effect="dark" content="分配角色" placement="top-start">
              <el-button
                type="info"
                icon="el-icon-user-solid"
                size="mini"
                @click="assignRole(row)"
              ></el-button>
            </el-tooltip>

            <el-tooltip effect="dark" content="修改用户" placement="top-start">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="updateUser(row)"
              ></el-button>
            </el-tooltip>

            <el-tooltip
              effect="dark"
              content="删除"
              placement="top-start"
              style="margin-left: 15px"
            >
              <el-popconfirm
                :title="`确定删除${row.username}吗？`"
                @onConfirm="deleteUse(row.id)"
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

      <!--分配角色 -->
      <el-dialog title="设置角色" :visible.sync="roleDialogVisible">
        <el-form label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="userName" :disabled="true"></el-input>
          </el-form-item>

          <el-form-item label="角色列表">
            <el-checkbox
              :indeterminate="isIndeterminate"
              @change="handleCheckAllChange"
              v-model="checkAll"
              >全选</el-checkbox
            >
            <div style="margin: 15px 0"></div>
            <el-checkbox-group
              v-model="checkedRole"
              @change="handleCheckedRolesChange"
            >
              <el-checkbox
                v-for="(role, index) in allRolesList"
                :key="index"
                :label="role.id"
                >{{ role.roleName }}</el-checkbox
              >
            </el-checkbox-group>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="saveRoles">保存</el-button>
          <el-button @click="cancel">取 消</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户 -->
      <el-dialog
        title="修改用户"
        :visible.sync="userDialogVisible"
      >
        <el-form label-width="80px" :model="userInfo" :rules="rules" ref="ruleForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfo.username"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="userInfo.nickName"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="userDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveUpdateUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 添加用户 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addUserDialogVisible"
      >
        <el-form label-width="80px" :model="addUser" :rules="rules" ref="userForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUser.username"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称">
            <el-input v-model="addUser.nickName"></el-input>
          </el-form-item>
          <el-form-item label="用户密码" prop="password">
            <el-input v-model="addUser.password" type="password"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelAddUser">取 消</el-button>
          <el-button type="primary" @click="addNewUser">确 定</el-button>
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
  </div>
</template>

<script>
export default {
  name: "User",
  data() {
    const validateUsername = (rule,value,callback) =>{
      if (!value || !value.trim()) {
        callback(new Error('用户名不能为空'))
      } else if (value.trim().length < 6){
        callback(new Error('至少需要6个字符'))
      }else{
        callback()
      }
    }
    const validatePassword = (rule,value,callback) =>{
      if (!value || !value.trim()) {
        callback(new Error('密码必须输入'))
      } else if (value.trim().length < 6){
        callback(new Error('至少需要6个字符'))
      }else{
        callback()
      }
    }
    return {
      limit: 10,
      total: 0,
      page: 1,
      userName: null,
      userId: null, //当前用户的ID,用于请求保存
      userInfo:{},//当前所选择的用户信息
      searchObj:{username:null},
      addUser:{},

      records: [], //当前页的列表信息
      selectedID: [], //被选择的用户
      allRolesList: [], //所有的角色列表
      checkedRole: [], //被选中的角色的id
      roleId: "", //被选中的角色的id，用于请求保存

      roleDialogVisible: false,//分配角色的dialog
      userDialogVisible:false,//修改用户的dialog
      addUserDialogVisible:false,//添加用户的dialog
      isIndeterminate: false, //实现全选
      checkAll: false,

      rules:{
        username:[{ required: true, trigger: 'blur', validator: validateUsername }],
        password:[{ required: true, trigger: 'blur', validator: validatePassword }],
      }
    };
  },
  mounted() {
    this.getListInfo();
  },
  methods: {
    // 重置用户数据
    resetData() {
      this.checkedRole = []; //被选中的角色的id
    },

    // 获取分页列表信息
    async getListInfo(searchObj) {
      const result = await this.$API.user.getPageList(this.page, this.limit,searchObj);
      this.records = result.data.items;
      this.total = result.data.total;
    },

    // 删除用户
    async deleteUse(id) {
      await this.$API.user.removeById(id);
      this.$message.success("删除成功");
      // 如果当前页只有一条数据则回到前一页
      this.records.length === 1 && this.page != 1
        ? (this.page -= 1)
        : this.page;
      this.getListInfo();
    },

    // 批量删除用户
    removeId() {
      // 先整理下selectedId
      let arr = [];
      this.selectedID.forEach((item) => {
        arr.push(item.id);
      });

      this.$confirm("确定删除吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const result = await this.$API.user.removeUsers(arr);
          this.$message.success("删除成功" || result.data);
        })
        .catch((action) => {
          if (action === "cancel") {
            this.$message.info("已取消");
          }
        });
    },

    // 根据用户获取角色数据列表
    async getRoles() {
      const result = await this.$API.user.getRoles(this.userId);

      this.allRolesList = result.data.allRolesList;
      let arr = result.data.assignRoles;

      // 将已经分配了的用户角色插入到checkedRole到页面渲染
      arr.forEach((item) => {
        this.checkedRole.push(item.id);
      });

      // 判断当前的checkedRole是否有数据，有数据则isIndeterminate为true
      if (this.checkedRole) {
        this.isIndeterminate = true;
      }
    },

    //保存所分配的角色
    async assignRoles() {
      // 将被选中的id提取出来
      this.roleId = this.checkedRole.join(",");
      await this.$API.user.assignRoles(this.userId, this.roleId);
      this.$message.success("添加成功");
    },

    // 添加用户
    addNewUser(){
      this.$refs['userForm'].validate(async (valid) => {
        if(valid) {
          try {
            await this.$API.user.add(this.addUser)
            this.$message.success('添加成功')
            this.addUserDialogVisible = false

            this.getListInfo()
          } catch (error) {
            this.$message.error('添加失败')
          }
        }else{
          return false;
        }
      })
    },

    // 取消添加用户
    cancelAddUser(){
      this.addUserDialogVisible = false
      this.addUser = {}
    },

    // 查询用户
    searchUsers(){
      this.getListInfo(this.searchObj)
    },

    // 清空搜索框
    cleanSearch(){
      this.searchObj.username = null
      this.getListInfo()
    },

    // 给用户分配角色
    assignRole(user) {
      this.userName = user.username;
      this.roleDialogVisible = true;
      this.userId = user.id;

      this.getRoles();
    },

    // 取消分配角色
    cancel() {
      this.roleDialogVisible = false;

      // 重置数据
      (this.checkedRole = []), //被选中的角色
        (this.roleId = []); //被选中的角色的id，用于保存

      this.isIndeterminate = false; //实现全选
      this.checkAll = false;
    },

    // 保存分配角色
    saveRoles() {
      this.assignRoles();
      this.roleDialogVisible = false;

      this.getListInfo();
    },

    // 修改用户
    updateUser(userInfo){
      this.userDialogVisible = true
      this.userInfo = {...userInfo}//浅拷贝
      this.userDialogVisible = false
    },

    // 保存对已有的用户进行的修改
    async saveUpdateUser(){
      const result = await this.$API.user.update(this.userInfo)
      this.$message.success('保存成功！')
      console.log(result)
      this.getListInfo()
    },

    // 设置一页显示的数量
    handleSizeChange(val) {
      this.limit = val;
      this.getListInfo();
    },

    // 设置当前页面
    handleCurrentChange(val) {
      this.page = val;
      this.getListInfo();
    },

    // 全选用户
    handleSelectionChange(val) {
      // 将选中的数据的id插入到
      this.selectedID = val;
    },

    // 全选角色列表
    handleCheckAllChange(isCheckAll) {
      // 将所有的角色列表allRolesList过滤出id
      let arr = [];
      this.allRolesList.forEach((item) => {
        arr.push(item.id);
      });
      this.checkedRole = isCheckAll ? arr : [];
      this.isIndeterminate = false;
    },

    // 设置全选按钮
    handleCheckedRolesChange(value) {
      // value是label的取值
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.allRolesList.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.allRolesList.length;
    },
  },
};
</script>

<style></style>
