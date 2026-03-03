# MCUTrack MVP Scope Definition

## Phase 1: Core MVP (Weeks 1-4)

### Must Have (P0)

#### 1. Authentication & User Management
- [ ] Login page with email/password
- [ ] Session-based authentication (8-hour expiry)
- [ ] Role assignment (Admin creates users)
- [ ] Password hashing (bcrypt)
- [ ] Logout functionality

#### 2. Patient Management
- [ ] Patient registration form
- [ ] MRN auto-generation
- [ ] Patient search by MRN/name
- [ ] Patient list view
- [ ] Basic demographics (name, DOB, gender, company)

#### 3. MCU Package Configuration
- [ ] Create/edit MCU packages
- [ ] Define steps per package (department, order, required flag)
- [ ] Package list view
- [ ] Activate/deactivate packages

#### 4. Visit Workflow (Core)
- [ ] Create new visit (select patient + package)
- [ ] Visit queue dashboard
- [ ] Step status tracking (WAITING → IN_PROGRESS → DONE)
- [ ] Department-specific views (Nursing, Lab, Radiology)
- [ ] Visit completion by doctor
- [ ] Fit/Unfit decision

#### 5. Medical Results Input
- [ ] Lab result form (numeric values with units)
- [ ] Radiology result form (text findings)
- [ ] Doctor final assessment form
- [ ] Result review status tracking

#### 6. Real-Time Dashboard
- [ ] Visit count by status
- [ ] Department workload view
- [ ] Queue position display
- [ ] Auto-refresh (30s interval)

#### 7. Audit Logging
- [ ] Log all status changes
- [ ] Log all result submissions
- [ ] Log login/logout
- [ ] Admin audit view

---

## Phase 2: Enhanced Features (Weeks 5-8)

### Should Have (P1)

#### 1. Advanced Workflow
- [ ] Parallel step execution (Lab + Radiology simultaneously)
- [ ] Step reassignment
- [ ] Visit transfer between departments
- [ ] Priority flagging (urgent cases)

#### 2. Result Management
- [ ] Reference range validation (auto-flag abnormal)
- [ ] Result amendment with version history
- [ ] Result approval workflow
- [ ] Attachment upload (X-ray images, PDFs)

#### 3. Reporting
- [ ] MCU report generation (PDF)
- [ ] Company summary reports
- [ ] Export to CSV/Excel
- [ ] Print-friendly format

#### 4. Notifications
- [ ] Department queue alerts
- [ ] Visit completion notification
- [ ] Overdue step warnings

#### 5. Admin Features
- [ ] User management (CRUD)
- [ ] Role assignment
- [ ] System configuration
- [ ] Backup/restore interface

---

## Phase 3: Advanced (Post-MVP)

### Nice to Have (P2)

#### 1. Analytics
- [ ] Turnaround time analytics
- [ ] Department efficiency metrics
- [ ] Peak hour analysis
- [ ] Historical trends

#### 2. Integration
- [ ] Lab equipment integration (HL7)
- [ ] PACS integration for radiology
- [ ] EMR export capability

#### 3. Patient Portal
- [ ] Patient result viewing
- [ ] Appointment scheduling
- [ ] Digital consent forms

#### 4. Mobile
- [ ] Nurse mobile app (check-in)
- [ ] Doctor mobile approval
- [ ] Tablet-optimized department views

---

## MVP Database Entities

```
User (id, email, password, name, role, isActive)
Patient (id, mrn, firstName, lastName, dob, gender, company)
MCUPackage (id, name, code, description, isActive)
PackageStep (id, packageId, department, stepName, stepOrder, isRequired)
Visit (id, visitNumber, patientId, packageId, status, assignedDoctorId, finalDecision)
VisitStep (id, visitId, packageStepId, status, performedBy, completedAt)
MedicalResult (id, visitId, visitStepId, department, resultType, resultData, isReviewed)
AuditLog (id, userId, visitId, action, entityType, entityId, oldValue, newValue, createdAt)
```

---

## MVP User Stories

### Admin
1. As admin, I can create user accounts so staff can access the system
2. As admin, I can configure MCU packages so they match company contracts
3. As admin, I can view audit logs so I can ensure compliance

### Nurse (Front Desk)
4. As nurse, I can register new patients so they can start their MCU
5. As nurse, I can create new visits so patients enter the workflow
6. As nurse, I can view the queue so I can manage patient flow

### Lab Technician
7. As lab tech, I can see my department's pending tasks so I know what to do
8. As lab tech, I can input lab results so doctors can review them
9. As lab tech, I can mark steps as complete so the workflow progresses

### Radiology Technician
10. As radiology tech, I can see radiology requests so I can schedule imaging
11. As radiology tech, I can input findings so doctors can make decisions

### Doctor
12. As doctor, I can view all completed results so I can make final assessment
13. As doctor, I can mark patients as FIT/UNFIT so companies receive decisions
14. As doctor, I can add medical notes so there's a record of findings

---

## MVP Success Criteria

| Metric | Target |
|--------|--------|
| Visit creation time | < 2 minutes |
| Status update latency | < 1 second |
| Dashboard refresh | < 3 seconds |
| Concurrent users | 20+ without degradation |
| Audit log coverage | 100% of status changes |
| Uptime (local server) | 99% during business hours |

---

## Out of Scope (MVP)

- Patient portal
- Mobile applications
- External system integration
- Advanced analytics
- Multi-language support
- Offline data sync (system is offline-first by design)
- Biometric authentication
- Digital signatures

---

## Technical Constraints

- **No internet dependency** - All assets local
- **PostgreSQL self-hosted** - Hospital server only
- **JavaScript only** - No TypeScript in MVP (add later)
- **Single location** - No multi-branch support initially
- **Browser-based** - Chrome/Firefox on Windows only

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Database corruption | Daily automated backups |
| Server failure | Redundant power supply, UPS |
| Data breach | Role-based access, audit logging |
| User error | Confirmation dialogs, undo capability |
| Performance degradation | Index optimization, query limits |
