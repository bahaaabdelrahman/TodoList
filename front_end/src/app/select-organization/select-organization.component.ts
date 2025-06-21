import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { OrganizationService, Organization } from '../services/organization.service';

@Component({
  selector: 'app-select-organization',
  templateUrl: './select-organization.component.html',
  styleUrls: ['./select-organization.component.css'],
  standalone: false
})
export class SelectOrganizationComponent implements OnInit {
  organizations: Organization[] = [];
  selectedOrgId: string = '';
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  @Output() organizationSelected = new EventEmitter<void>();

  constructor(private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.organizationService.getOrganizations().subscribe({
      next: (orgs) => this.organizations = orgs,
      error: () => {
        this.message = 'فشل تحميل قائمة المنظمات';
        this.messageType = 'error';
      }
    });
  }

  confirmSelection(): void {
    if (!this.selectedOrgId) {
      this.message = 'Please select an organization';
      this.messageType = 'error';
      return;
    }

    localStorage.setItem('organizationId', this.selectedOrgId);
    this.message = '✅ Organization selected successfully';
    this.messageType = 'success';

    setTimeout(() => {
      this.organizationSelected.emit();
    }, 500);
  }
}

