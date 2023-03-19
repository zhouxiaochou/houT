<template>
  <div style="margin: 15px">
    <el-input v-model="this.$route.query.roleName" disabled></el-input>
    
    <el-tree
      style="margin: 15px 0"
      ref="tree"
      :data="listInfo"
      show-checkbox
      node-key="id"
      default-expand-all
      :default-checked-keys="checkedKeys"
      :props="defaultProps"
    >
    </el-tree>

    <el-button type="primary" @click="save">保存</el-button>
    <el-button @click="$router.replace({name:'Role'})">取消</el-button>
  </div>
</template>

<script>
export default {
  name: "Authority",
  data() {
    return {
      listInfo: [], //显示权限列表
      defaultProps: {
        children: "children",
        label: "name",
      },
      checkedKeys: [], //默认选中的节点
    };
  },
  mounted() {
    this.assignList();
  },
  methods: {
    // 获取当前角色权限菜单
    async assignList() {
      let id = this.$route.query.id;
      await this.$API.permission.toAssign(id).then((result) => {
        this.listInfo = result.data.children;
        this.getCheckedIds(this.listInfo);
        this.$refs.tree.setCheckedKeys(this.checkedKeys);
      });
    },

    // 得到所有选择的id列表
    getCheckedIds(auths) {
      auths.forEach((item) => {
        if (item.select && item.level === 4) {
          this.checkedKeys.push(item.id);
        }
        this.getCheckedIds(item.children);
      });
    },

    // 保存
    save() {
      const keys = this.$refs.tree.getCheckedKeys().join(",");
      let id = this.$route.query.id;
      this.$API.permission.doAssign(id,keys).then(result=>{
        this.$message.success('分配权限成功')
        this.$router.replace('/acl/role',()=>{
          console.log('replace onComplete')
        })
      })
    },
  },
};
</script>

<style></style>
