package handlers

import (
	"fmt"
	"net/http"
	"time"

	"mcu-track/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateVisitRequest struct {
	PatientID string `json:"patientId" binding:"required"`
	PackageID string `json:"packageId" binding:"required"`
	Notes     string `json:"notes"`
}

func CreateVisit(c *gin.Context) {
	var req CreateVisitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	// Generate visit number
	visitNumber := generateVisitNumber()

	// Get package with steps
	var pkg models.MCUPackage
	if err := models.DB.Preload("Steps").First(&pkg, "id = ?", req.PackageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		return
	}

	// Create visit
	visit := models.Visit{
		VisitNumber: visitNumber,
		PatientID:   req.PatientID,
		PackageID:   req.PackageID,
		Status:      models.VisitStatusWaiting,
		Notes:       req.Notes,
	}

	if err := models.DB.Create(&visit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create visit"})
		return
	}

	// Create visit steps from package steps
	for _, pkgStep := range pkg.Steps {
		visitStep := models.VisitStep{
			VisitID:       visit.ID,
			PackageStepID: pkgStep.ID,
			Status:        models.StepStatusWaiting,
		}
		models.DB.Create(&visitStep)
	}

	// Reload visit with relations
	models.DB.Preload("Patient").Preload("Package").Preload("Steps", func(db *gorm.DB) *gorm.DB {
		return db.Preload("PackageStep")
	}).First(&visit, visit.ID)

	logAudit(c, userID.(string), visit.ID, models.AuditActionCreate, models.EntityTypeVisit, visit.ID, nil, map[string]interface{}{
		"visitNumber": visitNumber,
		"patientId":   req.PatientID,
		"packageId":   req.PackageID,
	})

	c.JSON(http.StatusCreated, gin.H{"success": true, "visit": visit})
}

func GetVisits(c *gin.Context) {
	status := c.Query("status")

	var visits []models.Visit
	query := models.DB.Preload("Patient", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, mrn, first_name, last_name, company")
	}).Preload("Package", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name, code")
	}).Order("created_at DESC").Limit(100)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&visits).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch visits"})
		return
	}

	c.JSON(http.StatusOK, visits)
}

func GetVisitByID(c *gin.Context) {
	id := c.Param("id")

	var visit models.Visit
	if err := models.DB.
		Preload("Patient").
		Preload("Package", func(db *gorm.DB) *gorm.DB {
			return db.Preload("Steps", func(db *gorm.DB) *gorm.DB {
				return db.Order("step_order ASC")
			})
		}).
		Preload("Steps", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC").Preload("PackageStep")
		}).
		Preload("Results").
		Preload("AssignedDoctor", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email")
		}).
		First(&visit, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visit not found"})
		return
	}

	c.JSON(http.StatusOK, visit)
}

func GetVisitWorkflow(c *gin.Context) {
	id := c.Param("id")

	var visit models.Visit
	if err := models.DB.
		Preload("Patient").
		Preload("Package", func(db *gorm.DB) *gorm.DB {
			return db.Preload("Steps", func(db *gorm.DB) *gorm.DB {
				return db.Order("step_order ASC")
			})
		}).
		Preload("Steps", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC").Preload("PackageStep")
		}).
		Preload("Results").
		First(&visit, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visit not found"})
		return
	}

	// Map steps with their status
	type WorkflowStep struct {
		models.PackageStep
		VisitStepID *string            `json:"visitStepId"`
		Status      models.StepStatus  `json:"status"`
		PerformedBy string             `json:"performedBy"`
		CompletedAt *time.Time         `json:"completedAt"`
	}

	workflowSteps := []WorkflowStep{}
	totalSteps := len(visit.Package.Steps)
	completedSteps := 0

	for _, pkgStep := range visit.Package.Steps {
		step := WorkflowStep{
			PackageStep: pkgStep,
			Status:      models.StepStatusWaiting,
		}

		// Find corresponding visit step
		for _, vs := range visit.Steps {
			if vs.PackageStepID == pkgStep.ID {
				step.VisitStepID = &vs.ID
				step.Status = vs.Status
				step.PerformedBy = vs.PerformedBy
				step.CompletedAt = vs.CompletedAt
				break
			}
		}

		if step.Status == models.StepStatusDone {
			completedSteps++
		}

		workflowSteps = append(workflowSteps, step)
	}

	progress := 0.0
	if totalSteps > 0 {
		progress = float64(completedSteps) / float64(totalSteps) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"visit":          visit,
		"workflowSteps":  workflowSteps,
		"progress":       progress,
	})
}

type UpdateVisitStatusRequest struct {
	Status models.VisitStatus `json:"status" binding:"required"`
	Notes  string             `json:"notes"`
}

func UpdateVisitStatus(c *gin.Context) {
	id := c.Param("id")

	var req UpdateVisitStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	userID, _ := c.Get("userID")
	userRole, _ := c.Get("role")

	// Get current visit
	var visit models.Visit
	if err := models.DB.First(&visit, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visit not found"})
		return
	}

	// Check role permission
	if !canTransition(userRole.(models.Role), visit.Status, req.Status) {
		logAudit(c, userID.(string), visit.ID, models.AuditActionPermissionDenied, models.EntityTypeVisit, visit.ID, nil, map[string]interface{}{
			"attemptedStatus": req.Status,
		})
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied for this transition"})
		return
	}

	// Validate requirements for DONE status
	if req.Status == models.VisitStatusDone {
		var incompleteSteps int64
		models.DB.Model(&models.VisitStep{}).Where("visit_id = ? AND status != ?", visit.ID, models.StepStatusDone).Count(&incompleteSteps)
		
		if incompleteSteps > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%d step(s) not yet completed", incompleteSteps)})
			return
		}
	}

	// Update visit
	now := time.Now()
	updateData := map[string]interface{}{
		"status":     req.Status,
		"updated_at": now,
	}

	if req.Status == models.VisitStatusDone {
		updateData["completed_at"] = now
	}
	if req.Notes != "" {
		updateData["notes"] = req.Notes
	}

	if err := models.DB.Model(&visit).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update visit status"})
		return
	}

	logAudit(c, userID.(string), visit.ID, models.AuditActionStatusChange, models.EntityTypeVisit, visit.ID, map[string]interface{}{
		"status": visit.Status,
	}, map[string]interface{}{
		"status": req.Status,
	})

	// Reload visit
	models.DB.First(&visit, visit.ID)

	c.JSON(http.StatusOK, gin.H{"success": true, "visit": visit})
}

type UpdateStepStatusRequest struct {
	Status models.StepStatus `json:"status" binding:"required"`
	Notes  string            `json:"notes"`
}

func UpdateStepStatus(c *gin.Context) {
	stepID := c.Param("stepId")

	var req UpdateStepStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	userID, _ := c.Get("userID")

	// Get current step
	var step models.VisitStep
	if err := models.DB.Preload("Visit").First(&step, "id = ?", stepID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Step not found"})
		return
	}

	// Update step
	now := time.Now()
	updateData := map[string]interface{}{
		"status":     req.Status,
		"updated_at": now,
	}

	if req.Status == models.StepStatusInProgress && step.StartedAt == nil {
		updateData["started_at"] = now
	}
	if req.Status == models.StepStatusDone {
		updateData["completed_at"] = now
	}
	if req.Notes != "" {
		updateData["notes"] = req.Notes
	}
	updateData["performed_by"] = userID

	if err := models.DB.Model(&step).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update step status"})
		return
	}

	// Auto-update visit status to IN_PROGRESS when first step starts
	if req.Status == models.StepStatusInProgress && step.Visit.Status == models.VisitStatusWaiting {
		models.DB.Model(&step.Visit).Update("status", models.VisitStatusInProgress)
	}

	logAudit(c, userID.(string), step.VisitID, models.AuditActionStatusChange, models.EntityTypeVisitStep, step.ID, map[string]interface{}{
		"status": step.Status,
	}, map[string]interface{}{
		"status": req.Status,
	})

	// Reload step
	models.DB.First(&step, step.ID)

	c.JSON(http.StatusOK, gin.H{"success": true, "step": step})
}

func GetDashboardStats(c *gin.Context) {
	var waitingCount, inProgressCount, doneCount, todayCount int64

	models.DB.Model(&models.Visit{}).Where("status = ?", models.VisitStatusWaiting).Count(&waitingCount)
	models.DB.Model(&models.Visit{}).Where("status = ?", models.VisitStatusInProgress).Count(&inProgressCount)
	models.DB.Model(&models.Visit{}).Where("status = ?", models.VisitStatusDone).Count(&doneCount)

	// Today's visits
	today := time.Now().Truncate(24 * time.Hour)
	models.DB.Model(&models.Visit{}).Where("created_at >= ?", today).Count(&todayCount)

	c.JSON(http.StatusOK, gin.H{
		"waiting":    waitingCount,
		"inProgress": inProgressCount,
		"done":       doneCount,
		"today":      todayCount,
	})
}

func generateVisitNumber() string {
	now := time.Now()
	dateStr := now.Format("20060102")

	var count int64
	models.DB.Model(&models.Visit{}).Where("visit_number LIKE ?", dateStr+"%").Count(&count)

	sequence := fmt.Sprintf("%03d", count+1)
	return fmt.Sprintf("MCU-%s-%s", dateStr, sequence)
}

func canTransition(role models.Role, fromStatus, toStatus models.VisitStatus) bool {
	permissions := map[models.Role][]models.VisitStatus{
		models.RoleAdmin:     {models.VisitStatusWaiting, models.VisitStatusInProgress, models.VisitStatusDone, models.VisitStatusCancelled},
		models.RoleNurse:     {models.VisitStatusWaiting, models.VisitStatusInProgress},
		models.RoleDoctor:    {models.VisitStatusInProgress, models.VisitStatusDone},
		models.RoleLab:       {models.VisitStatusInProgress},
		models.RoleRadiology: {models.VisitStatusInProgress},
	}

	allowedStatuses, ok := permissions[role]
	if !ok {
		return false
	}

	for _, s := range allowedStatuses {
		if s == toStatus {
			return true
		}
	}
	return false
}
