package handlers

import (
	"encoding/json"
	"mcu-track/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAuditLogs(c *gin.Context) {
	var auditLogs []models.AuditLog

	query := models.DB.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, email, name, role")
	}).Preload("Visit", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, visit_number")
	}).Order("created_at DESC").Limit(100)

	// Optional filters
	if action := c.Query("action"); action != "" {
		query = query.Where("action = ?", action)
	}
	if userID := c.Query("userId"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if visitID := c.Query("visitId"); visitID != "" {
		query = query.Where("visit_id = ?", visitID)
	}

	if err := query.Find(&auditLogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs"})
		return
	}

	c.JSON(http.StatusOK, auditLogs)
}

// Helper to convert interface to JSON string
func interfaceToJSON(v interface{}) string {
	if v == nil {
		return ""
	}
	b, err := json.Marshal(v)
	if err != nil {
		return ""
	}
	return string(b)
}
