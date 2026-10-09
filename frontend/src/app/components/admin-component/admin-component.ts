import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { AdminService } from '../../services/admin-service';
import { SlicePipe } from '@angular/common';
import { Category } from '../../models/category';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { AdminStatsComponent } from '../admin-stats-component/admin-stats-component';

@Component({
  selector: 'app-admin-component',
  imports: [SlicePipe, FormsModule, AdminStatsComponent],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css',
})
export class AdminComponent implements OnInit {
  activeTab: 'pending' | 'users' | 'categories' | 'stats' = 'pending';
  currentUser: any = null;

  pendingUsers: User[] = [];

  allUsers: User[] = [];
  editingUser: User | null = null;
  editUserData: any = {};

  allCategories: Category[] = [];
  newCategoryName: string = '';
  selectedCategoryForSub: string = '';
  newSubcategoryName: string = '';

  errorMessage = '';
  successMessage = '';

  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
    console.log(this.currentUser);

    this.loadPendingUsers();
    this.loadAllUsers();
    this.loadCategories();
  }

  loadPendingUsers() {
    this.adminService.getPendingUsers().subscribe({
      next: (users) => {
        this.pendingUsers = users;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load pending users.';
        console.error(error);
      }
    });
  }

  loadAllUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users.';
        console.error(error);
      }
    });
  }

  changeStatus(userId: string, status: 'approved' | 'rejected') {
    this.adminService.updateUserStatus(userId, status).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(user => user._id !== userId);
      },
      error: (error) => {
        this.errorMessage = `Failed to load ${status} user.`;
      }
    });
  }

  deleteUser(userId: string) {
    if (confirm("Are you sure you want to delete this user? This action can't be undone.")) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.allUsers = this.allUsers.filter(user => user._id !== userId);
          this.pendingUsers = this.pendingUsers.filter(user => user._id !== userId);
        },
        error: () => alert('Failed to delete user!')
      });
    }
  }

  startEdit(user: User) {
    this.editingUser = user;
    this.editUserData = { ...user };
  }

  cancelEdit() {
    this.editingUser = null;
    this.editUserData = {};
  }

  saveUserChanges() {
    if (!this.editingUser?._id) return;

    this.adminService.updateUserDetails(this.editingUser._id, this.editUserData).subscribe({
      next: (res: any) => {
        this.successMessage = 'User updatted successfully!';

        const index = this.allUsers.findIndex(user => user._id === this.editingUser!._id);
        if (index !== -1) {
          this.allUsers[index] = res.user;
        }

        this.cancelEdit();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update user.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  loadCategories() {
    this.adminService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories.';
        console.error(error);
      }
    });
  }

  addCategory() {
    if (!this.newCategoryName || !this.newCategoryName.trim()) return;

    this.adminService.addCategory(this.newCategoryName).subscribe({
      next: () => {
        this.successMessage = 'Category added successfully.';
        this.newCategoryName = '';
        this.loadCategories();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => alert(error.error?.message || 'Error adding category.')
    });
  }

  addSubcategory() {
    if (!this.selectedCategoryForSub || !this.selectedCategoryForSub.trim()) return;

    this.adminService.addSubcategory(this.selectedCategoryForSub, this.newSubcategoryName).subscribe({
      next: () => {
        this.successMessage = 'Subcategory added successfully.';
        this.newSubcategoryName = '';
        this.loadCategories();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => alert(error.error?.message || 'Error adding subcategory.')
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
