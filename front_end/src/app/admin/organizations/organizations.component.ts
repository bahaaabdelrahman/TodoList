import { OrganizationService, Organization } from './../../services/organization.service';
import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-organizations',
  standalone: false,
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.css'
})


export class OrganizationsComponent implements OnInit {
  createForm!: FormGroup;
  updateForm!: FormGroup;
  userForm!: FormGroup;
  removeForm!: FormGroup;

  organizations: Organization[] = [];
  selectedOrgId: string | null = null;

  showOrganizations = false;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.removeForm = this.fb.group({
      userId: [null, Validators.required]
    });
  }

  loadOrganizations(): void {
    this.showOrganizations = !this.showOrganizations;

    if (this.showOrganizations) {
      this.organizationService.getOrganizations().subscribe(data => {
        this.organizations = data;
        console.log('المُنظمات:', this.organizations);
        if (this.organizations.length > 0) {
          console.log('مثال منظمة:', this.organizations[0]);
        }
      });
    } else {
      this.organizations = [];
    }
  }

  selectOrganization(orgId: string): void {
    console.log('تم اختيار منظمة ID =', orgId);
    this.selectedOrgId = orgId;

    // تحديث بيانات الفورم لتظهر بيانات المنظمة المختارة في نموذج التحديث
    const org = this.organizations.find(o => o._id === orgId);
    if (org) {
      this.updateForm.patchValue({
        name: org.name,
        description: org.description
      });
    }
  }

  createOrganization(): void {
    console.log('🟢 createOrganization() تم استدعاؤها');
    if (this.createForm.invalid) return;
    this.organizationService.createOrganization(this.createForm.value).subscribe(() => {
      this.loadOrganizations();
      this.createForm.reset();
    });
  }

  updateOrganization(): void {
    console.log('🟡 updateOrganization() تم استدعاؤها');
    console.log('selectedOrgId:', this.selectedOrgId);
    if (!this.selectedOrgId || this.updateForm.invalid) return;

    this.organizationService.updateOrganization(this.selectedOrgId, this.updateForm.value).subscribe(() => {
      this.loadOrganizations();
      this.updateForm.reset();
    });
  }


  addUserToOrganization(): void {
    console.log('🔵 addUserToOrganization() تم استدعاؤها');
    if (!this.selectedOrgId || this.userForm.invalid) return;
    this.organizationService.addUserToOrganization(this.selectedOrgId, this.userForm.value).subscribe(() => {
      this.userForm.reset();
    });
  }

  removeUserFromOrganization(): void {
    if (!this.selectedOrgId || this.removeForm.invalid) return;
    const userId = this.removeForm.value.userId.toString();  // حوّل إلى نص
    this.organizationService.removeUserFromOrganization(this.selectedOrgId, userId).subscribe(() => {
      this.removeForm.reset();
      // يمكن هنا إعادة تحميل البيانات أو تحديث الواجهة إذا تحتاج
    });
  }
}
