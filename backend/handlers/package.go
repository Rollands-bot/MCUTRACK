package handlers

import (
	"net/http"

	"mcu-track/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreatePackageRequest struct {
	Name        string              `json:"name" binding:"required"`
	Code        string              `json:"code" binding:"required"`
	Description string              `json:"description"`
	IsActive    bool                `json:"isActive"`
	Steps       []PackageStepRequest `json:"steps" binding:"required,dive"`
}

type PackageStepRequest struct {
	Department   string `json:"department" binding:"required"`
	StepName     string `json:"stepName" binding:"required"`
	StepOrder    int    `json:"stepOrder" binding:"required"`
	IsRequired   bool   `json:"isRequired"`
	Instructions string `json:"instructions"`
}

func CreatePackage(c *gin.Context) {
	var req CreatePackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	// Create package
	pkg := models.MCUPackage{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		IsActive:    req.IsActive,
	}

	if err := models.DB.Create(&pkg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create package"})
		return
	}

	// Create package steps
	for _, stepReq := range req.Steps {
		dept := models.Department(stepReq.Department)
		step := models.PackageStep{
			PackageID:    pkg.ID,
			Department:   dept,
			StepName:     stepReq.StepName,
			StepOrder:    stepReq.StepOrder,
			IsRequired:   stepReq.IsRequired,
			Instructions: stepReq.Instructions,
		}
		models.DB.Create(&step)
	}

	// Reload package with steps
	models.DB.Preload("Steps").First(&pkg, pkg.ID)

	logAudit(c, userID.(string), "", models.AuditActionCreate, models.EntityTypePackage, pkg.ID, nil, map[string]interface{}{
		"name": pkg.Name,
		"code": pkg.Code,
	})

	c.JSON(http.StatusCreated, gin.H{"success": true, "package": pkg})
}

func GetPackages(c *gin.Context) {
	query := models.DB.Where("is_active = ?", true)

	// Preload steps and count visits
	type PackageWithCount struct {
		models.MCUPackage
		VisitsCount int64 `gorm:"column:visits_count"`
	}

	var result []PackageWithCount
	if err := query.Model(&models.MCUPackage{}).
		Preload("Steps", func(db *gorm.DB) *gorm.DB {
			return db.Order("step_order ASC")
		}).
		Select("mcu_packages.*, COUNT(visits.id) as visits_count").
		Joins("LEFT JOIN visits ON visits.package_id = mcu_packages.id").
		Group("mcu_packages.id").
		Order("mcu_packages.name ASC").
		Find(&result).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch packages"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func GetPackageByID(c *gin.Context) {
	id := c.Param("id")

	var pkg models.MCUPackage
	if err := models.DB.Preload("Steps", func(db *gorm.DB) *gorm.DB {
		return db.Order("step_order ASC")
	}).First(&pkg, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		return
	}

	c.JSON(http.StatusOK, pkg)
}

func TogglePackageStatus(c *gin.Context) {
	id := c.Param("id")

	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	// Check if user is admin
	if role != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	var pkg models.MCUPackage
	if err := models.DB.First(&pkg, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		return
	}

	oldValue := map[string]interface{}{
		"is_active": pkg.IsActive,
	}

	newStatus := !pkg.IsActive
	if err := models.DB.Model(&pkg).Update("is_active", newStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle package status"})
		return
	}

	logAudit(c, userID.(string), "", models.AuditActionUpdate, models.EntityTypePackage, pkg.ID, oldValue, map[string]interface{}{
		"is_active": newStatus,
	})

	c.JSON(http.StatusOK, gin.H{"success": true})
}
