<template>
  <div id="app">
    <el-container style="height: 100vh;">
      <el-header height="60px" class="header">
        <div class="header-title">
          <i class="el-icon-phone-outline"></i>
          通讯录
        </div>
      </el-header>

      <el-container>
        <el-container>
          <el-header height="auto" class="search-header">
            <el-row :gutter="60" class="search-row" style="justify-content: center;">
              <el-col :span="12">
                <el-input v-model="searchQuery" placeholder="请输入姓名、电话、邮箱或地址进行搜索" prefix-icon="el-icon-search"
                  @input="filterContacts" />
              </el-col>
              <el-col :span="12" class="header-buttons">
                <el-button class="add-contact-button" type="primary" icon="el-icon-plus"
                  @click="showAddDialog">添加联系人</el-button>
                <el-button class="delete-contacts-button" type="danger" icon="el-icon-delete"
                  @click="deleteSelectedContacts" :disabled="!selectedContacts.length">批量删除</el-button>
              </el-col>
            </el-row>
          </el-header>


          <el-main style="padding: 20px; display: flex; justify-content: center;">
            <div style="width: 1000;">
              <el-table :data="paginatedContacts" border stripe style="width: 100%;" :height="tableHeight"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" label="姓名" width="150"></el-table-column>
                <el-table-column prop="phone" label="电话" width="180"></el-table-column>
                <el-table-column prop="email" label="邮箱" width="220"></el-table-column>
                <el-table-column prop="address" label="地址" width="250"></el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="scope">
                    <el-button class="edit-button" size="small" icon="el-icon-edit"
                      @click="editContact(scope.row)">编辑</el-button>
                    <el-button class="delete-button" size="small" icon="el-icon-delete"
                      @click="deleteContact(scope.row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <el-pagination background layout="prev, pager, next" :total="filteredContacts.length" :page-size="pageSize"
              :current-page.sync="currentPage" @current-change="handlePageChange" class="pagination"
              style="justify-content: center;" />
          </el-main>
        </el-container>
      </el-container>
    </el-container>


    <el-dialog :visible.sync="dialogVisible" title="联系人信息" width="500px" class="contact-dialog" :draggable="disable">
      <el-form :model="contactForm" label-width="80px" class="contact-form"
        style="margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
        <el-form-item label="姓名">
          <el-input v-model="contactForm.name"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="contactForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="contactForm.email"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="contactForm.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request';

export default {
  data() {
    return {
      contacts: [],
      filteredContacts: [],
      searchQuery: '',
      dialogVisible: false,
      contactForm: {
        id: null,
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      currentPage: 1,
      pageSize: 12,
      isEditing: false,
      tableHeight: 0,
      selectedContacts: []
    };
  },
  created() {
    this.fetchContacts();
    this.updateTableHeight();
    window.addEventListener('resize', this.updateTableHeight);
  },
  computed: {
    paginatedContacts() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      return this.filteredContacts.slice(start, end);
    }
  },
  methods: {
    fetchContacts() {
      request.get('/user/selectAll')
        .then(response => {
          this.contacts = response.data;
          this.filteredContacts = response.data;
        })
        .catch(error => {
          console.error(error);
        });
    },
    showAddDialog() {
      this.isEditing = false;
      this.contactForm = { id: null, name: '', phone: '', email: '', address: '' };
      this.dialogVisible = true;
    },
    editContact(contact) {
      this.isEditing = true;
      this.contactForm = { ...contact };
      this.dialogVisible = true;
    },
    submitForm() {
      if (!this.contactForm.name) {
        this.$message.error('姓名不能为空');
        return;
      }
      if (this.isEditing) {
        this.updateContact();
      } else {
        this.addContact();
      }
    },
    addContact() {
      request.post('/user/add', this.contactForm)
        .then(response => {
          this.dialogVisible = false;
          const newContactIndex = this.contacts.length;
          this.currentPage = Math.ceil(newContactIndex / this.pageSize);
          this.fetchContacts();
          this.$message({
            message: '添加联系人成功',
            type: 'success'
          });
        })
        .catch(error => {
          console.error('Error adding contact:', error);
        });
      this.currentPage = 1;
    },
    updateContact() {
      request.put(`/user/update/${this.contactForm.id}`, this.contactForm)
        .then(() => {
          this.dialogVisible = false;
          this.fetchContacts();
          this.$message({
            message: '更新联系人成功',
            type: 'success'
          });
        })
        .catch(error => {
          console.error(error);
        });
    },
    deleteContact(id) {
      this.$confirm('此操作将永久删除该联系人, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.delete(`/user/delete/${id}`)
          .then(() => {
            this.fetchContacts();
            this.$message({
              type: 'success',
              message: '删除联系人成功'
            });
          })
          .catch(error => {
            console.error(error);
          });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    deleteSelectedContacts() {
      const ids = this.selectedContacts.map(contact => contact.id);
      this.$confirm('此操作将永久删除选中的联系人, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.post('/user/delete/batch', ids)
          .then(() => {
            this.fetchContacts();
            this.$message({
              type: 'success',
              message: '批量删除成功'
            });
          })
          .catch(error => {
            console.error(error);
          });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    filterContacts() {
      const query = this.searchQuery.toLowerCase();
      this.filteredContacts = this.contacts.filter(contact => {
        return (
          contact.name.toLowerCase().includes(query) ||
          contact.phone.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.address.toLowerCase().includes(query)
        );
      });
      this.currentPage = 1;
    },

    updateTableHeight() {
      this.tableHeight = window.innerHeight - 150;
    },

    handlePageChange(page) {
      this.currentPage = page;
    },

    handleSelectionChange(selected) {
      this.selectedContacts = selected;
    }
  }
};
</script>

<style>
.header {
  background-color: #f2f2f2;
  display: flex;
  align-items: center;
  padding-left: 20px;
  font-size: 24px;
  font-weight: bold;
}

.sidebar {
  background-color: #fff;
}

.search-header {
  padding: 20px;
}

.header-buttons {
  display: flex;
  justify-content: flex-end;
}

.pagination {
  display: flex;
  justify-content: center;
}


el-container {
  padding: 0 20px;
}

.contact-form {
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.search-row {
  display: flex;
  justify-content: center;
}

.el-table {
  width: auto;
}
</style>
