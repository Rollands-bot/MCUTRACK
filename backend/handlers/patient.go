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
	NIP          string `json:"nip" binding:"required"`
	NamaLengkap  string `json:"nama_lengkap" binding:"required"`
	TanggalLahir string `json:"tanggal_lahir" binding:"required"` // YYYY-MM-DD format
	JenisKelamin string `json:"jenis_kelamin" binding:"required"`
	Plant        string `json:"plant"`
	DeptBagian   string `json:"dept_bagian"`
	Grup         string `json:"grup"`
	PaketMCU     string `json:"paket_mcu"`
}

func CreatePatient(c *gin.Context) {
	var req CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Validate jenis_kelamin
	if req.JenisKelamin != "L" && req.JenisKelamin != "P" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid jenis_kelamin value. Use 'L' for Laki-laki or 'P' for Perempuan"})
		return
	}

	// Parse tanggal_lahir
	tanggalLahir, err := time.Parse("2006-01-02", req.TanggalLahir)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tanggal_lahir format. Use YYYY-MM-DD"})
		return
	}

	userID, _ := c.Get("userID")

	patient := models.Patient{
		NIP:          req.NIP,
		NamaLengkap:  req.NamaLengkap,
		TanggalLahir: tanggalLahir,
		JenisKelamin: req.JenisKelamin,
		Plant:        req.Plant,
		DeptBagian:   req.DeptBagian,
		Grup:         req.Grup,
		PaketMCU:     req.PaketMCU,
	}

	if err := models.DB.Create(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient", "details": err.Error()})
		return
	}

	logAudit(c, userID.(string), "", models.AuditActionCreate, models.EntityTypePatient, patient.ID, nil, map[string]interface{}{
		"nip":           patient.NIP,
		"nama_lengkap":  patient.NamaLengkap,
	})

	c.JSON(http.StatusCreated, gin.H{"success": true, "patient": patient})
}

func GetPatients(c *gin.Context) {
	search := c.Query("search")

	var patients []models.Patient
	query := models.DB.Order("created_at DESC").Limit(100)

	if search != "" {
		query = query.Where(
			"nip ILIKE ? OR nama_lengkap ILIKE ? OR plant ILIKE ? OR dept_bagian ILIKE ?",
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
		"nip":          patient.NIP,
		"nama_lengkap": patient.NamaLengkap,
	}

	// Parse tanggal_lahir
	tanggalLahir, err := time.Parse("2006-01-02", req.TanggalLahir)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tanggal_lahir format. Use YYYY-MM-DD"})
		return
	}

	// Update fields
	patient.NIP = req.NIP
	patient.NamaLengkap = req.NamaLengkap
	patient.TanggalLahir = tanggalLahir
	patient.JenisKelamin = req.JenisKelamin
	patient.Plant = req.Plant
	patient.DeptBagian = req.DeptBagian
	patient.Grup = req.Grup
	patient.PaketMCU = req.PaketMCU

	if err := models.DB.Save(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient"})
		return
	}

	logAudit(c, userID.(string), "", models.AuditActionUpdate, models.EntityTypePatient, patient.ID, oldValue, map[string]interface{}{
		"nip":          patient.NIP,
		"nama_lengkap": patient.NamaLengkap,
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "patient": patient})
}

func generateNIP() string {
	now := time.Now()
	year := now.Year()

	var count int64
	models.DB.Model(&models.Patient{}).Where("extract(year from created_at) = ?", year).Count(&count)

	return fmt.Sprintf("%d%04d", year, count+1)
}
