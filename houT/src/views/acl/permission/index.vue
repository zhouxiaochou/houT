<template>
  <el-card>
    <div>
      <el-table
        :data="permissionList"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="名称"> </el-table-column>
        <el-table-column prop="code" label="全限制"> </el-table-column>
        <el-table-column prop="toCode" label="跳转权限值"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <div>
              <!-- 添加功能 -->
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="toAddPermission(row)"
              ></el-button>
              <!-- 修改菜单 -->
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-edit"
                :disabled="row.name == '全部数据'"
                @click="editAuth(row)"
              ></el-button>
              <!-- 删除 -->
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                :disabled="row.name == '全部数据'"
                @click="deleteAuth(row)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form
        :model="authsForm"
        ref="editAuth"
        :rules="rules"
        label-width="150px"
        style="width: 90%"
      >
        <el-form-item label="父级名称" prop="pname" v-if="authsForm.pname">
          <el-input :value="authsForm.pname" disabled></el-input>
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input v-model="authsForm.name"></el-input>
        </el-form-item>

        <el-form-item label="功能权限值" prop="code">
          <el-input v-model="authsForm.code"></el-input>
        </el-form-item>

        <el-form-item
          label="跳转路由权限值"
          prop="toCode"
          v-if="authsForm.level === 4"
        >
          <el-input v-model="authsForm.toCode"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "Permission",
  data() {
    return {
      permissionList: [], //所有的权限菜单
      dialogVisible: false,
      authsForm: { name: "", code: "", level: "", toCode: "" }, //编辑权限所获取的数据
      rules: {
        name: [{ required: true, message: "名称必须填写", trigger: "blur" }],
        code: [{ required: true, message: "权限值必须输入", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getPermissionList();
  },
  computed: {
    /* 
      动态计算得到dialog的标题
    */
    dialogTitle() {
      const { id, level } = this.authsForm;
      console.log(id);
      if (id) {
        return level === 4 ? "修改功能" : "修改菜单";
      } else {
        return level === 4
          ? "添加功能"
          : `添加${level === 2 ? "一级" : "二级"}菜单`;
      }
    },
  },
  methods: {
    /* 
    重置数据
    */
    resetData() {
      this.dialogVisible = false;
      this.authsForm = {
        level: 0,
        name: "",
        code: "",
        toCode: "",
      };
    },
    // 获取权限菜单
    async getPermissionList() {
      const result = await this.$API.permission.getPermissionList();
      this.permissionList = result.data.children;
    },

    //删除权限
    deleteAuth(auth) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$API.permission.removePermission(auth.id);
          this.$message.success("删除成功");
          this.getPermissionList();
        })
        .catch((action) => {
          if (action === "cancel") {
            this.$message.info("已取消删除");
          }
        });
    },

    // 编辑权限
    editAuth(auth) {
      this.authsForm = { ...auth };
      this.dialogVisible = true;
      this.authsForm.type = this.authsForm.level === 4 ? 2 : 1

      // 清除校验(必须在界面更新之后)
      this.$nextTick(() => this.$refs.editAuth.clearValidate());
    },
    // 提交编辑权限
    submitEdit() {
      this.$refs["editAuth"].validate((valid) => {
        if (valid) {
          if (this.authsForm.id) {
            this.$API.permission
              .updatePermission(this.authsForm)
              .then((result) => {
                this.$message.success("修改成功！");
                this.dialogVisible = false;
                this.getPermissionList();
              });
          } else {
            const {pid, name, code, toCode,level,type } = this.authsForm;
            let permissionObj = {
              pid,
              name,
              code,
              toCode,
              level,
              type
            };
            this.$API.permission.addPermission(permissionObj).then(res => {
              this.$message.success("添加成功");
              this.dialogVisible = false;
              this.getPermissionList();
              console.log(res)
            });
          }
        }
      });
      this.resetData();
    },

    // 添加菜单
    toAddPermission(auth) {
      // 先重置数据
      this.resetData();
      this.dialogVisible = true;
      this.authsForm.pname = auth.name;
      this.authsForm.level = auth.level + 1;
      this.authsForm.pid = auth.id;

      this.authsForm.type = this.authsForm.level === 4 ? 2 : 1
    },
  },
};
</script>

<style></style>
