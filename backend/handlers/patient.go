package handlers

import (
	"fmt"
	"net/http"
	"time"

	"mcu-track/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreatePatientRequest struct {
	MRN         string    `json:"mrn"`
	FirstName   string    `json:"firstName" binding:"required"`
	LastName    string    `json:"lastName" binding:"required"`
	DateOfBirth time.Time `json:"dateOfBirth" binding:"required"`
	Gender      string    `json:"gender" binding:"required"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	Company     string    `json:"company"`
	IDNumber    string    `json:"idNumber"`
}

func CreatePatient(c *gin.Context) {
	var req CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Generate MRN if not provided
	mrn := req.MRN
	if mrn == "" {
		mrn = generateMRN()
	}

	// Validate gender
	gender := models.Gender(req.Gender)
	if gender != models.GenderMale && gender != models.GenderFemale && gender != models.GenderOther {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid gender value"})
		return
	}

	userID, _ := c.Get("userID")

	patient := models.Patient{
		MRN:         mrn,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		DateOfBirth: req.DateOfBirth,
		Gender:      gender,
		Phone:       req.Phone,
		Email:       req.Email,
		Company:     req.Company,
		IDNumber:    req.IDNumber,
	}

	if err := models.DB.Create(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient"})
		return
	}

	logAudit(c, userID.(string), "", models.AuditActionCreate, models.EntityTypePatient, patient.ID, nil, map[string]interface{}{
		"mrn": patient.MRN,
	})

	c.JSON(http.StatusCreated, gin.H{"success": true, "patient": patient})
}

func GetPatients(c *gin.Context) {
	search := c.Query("search")

	var patients []models.Patient
	query := models.DB.Order("created_at DESC").Limit(100)

	if search != "" {
		query = query.Where(
			"mrn ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ? OR company ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%",
		)
	}

	if err := query.Find(&patients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients"})
		return
	}

	c.JSON(http.StatusOK, patients)
}

func GetPatientByID(c *gin.Context) {
	id := c.Param("id")

	var patient models.Patient
	if err := models.DB.Preload("Visits", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC").Limit(10)
	}).First(&patient, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	c.JSON(http.StatusOK, patient)
}

func UpdatePatient(c *gin.Context) {
	id := c.Param("id")

	var req CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	userID, _ := c.Get("userID")

	var patient models.Patient
	if err := models.DB.First(&patient, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	// Get old values for audit
	oldValue := map[string]interface{}{
		"mrn":        patient.MRN,
		"first_name": patient.FirstName,
		"last_name":  patient.LastName,
	}

	// Update fields
	patient.FirstName = req.FirstName
	patient.LastName = req.LastName
	patient.DateOfBirth = req.DateOfBirth
	patient.Gender = models.Gender(req.Gender)
	patient.Phone = req.Phone
	patient.Email = req.Email
	patient.Company = req.Company
	patient.IDNumber = req.IDNumber

	if err := models.DB.Save(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient"})
		return
	}

	logAudit(c, userID.(string), "", models.AuditActionUpdate, models.EntityTypePatient, patient.ID, oldValue, map[string]interface{}{
		"mrn":        patient.MRN,
		"first_name": patient.FirstName,
		"last_name":  patient.LastName,
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "patient": patient})
}

func generateMRN() string {
	now := time.Now()
	year := now.Year()
	
	var count int64
	models.DB.Model(&models.Patient{}).Where("extract(year from created_at) = ?", year).Count(&count)
	
	return fmt.Sprintf("%d%04d", year, count+1)
}
