package handlers

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"mcu-track/models"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

type PreviewRow struct {
	RowNum       int    `json:"rowNum"`
	NIP          string `json:"nip"`
	NamaLengkap  string `json:"nama_lengkap"`
	JenisKelamin string `json:"jenis_kelamin"`
	TanggalLahir string `json:"tanggal_lahir"`
	Plant        string `json:"plant"`
	DeptBagian   string `json:"dept_bagian"`
	Grup         string `json:"grup"`
	PaketMCU     string `json:"paket_mcu"`
	Error        string `json:"error,omitempty"`
}

type PreviewResult struct {
	Total      int           `json:"total"`
	Valid      int           `json:"valid"`
	Invalid    int           `json:"invalid"`
	Rows       []PreviewRow  `json:"rows"`
}

type ImportRequest struct {
	Rows []PreviewRow `json:"rows"`
}

type ImportResult struct {
	Total      int      `json:"total"`
	Success    int      `json:"success"`
	Failed     int      `json:"failed"`
	FailedRows []string `json:"failedRows"`
}

// PreviewPatients - Preview Excel data without saving
func PreviewPatients(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	uploadedFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer uploadedFile.Close()

	fileBytes, err := io.ReadAll(uploadedFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}

	f, err := excelize.OpenReader(bytes.NewReader(fileBytes))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Excel file format"})
		return
	}
	defer f.Close()

	sheetName := f.GetSheetName(0)
	rows, err := f.GetRows(sheetName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read Excel rows"})
		return
	}

	if len(rows) < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Excel file is empty"})
		return
	}

	result := PreviewResult{
		Total:   0,
		Valid:   0,
		Invalid: 0,
		Rows:    []PreviewRow{},
	}

	startRow := 0
	// Detect header row (first row contains column names)
	if len(rows) > 0 && len(rows[0]) >= 8 {
		firstCell := strings.ToLower(strings.TrimSpace(rows[0][0]))
		if firstCell == "nip" || firstCell == "no" || firstCell == "id" {
			startRow = 1 // Skip header
		}
	}

	// Process data rows
	for i := startRow; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1 // Excel row number (1-based)
		result.Total++

		// Debug: show first few cells
		if i == startRow {
			fmt.Printf("Row %d cells: [%v] [%v] [%v] [%v] [%v] [%v] [%v] [%v]\n", 
				rowNum, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7])
		}

		// Handle both 8-column and 9-column formats
		// 8 columns: NIP, Nama, JK, TglLahir, Plant, Dept, Grup, Paket
		// 9 columns: No, NIP, Nama, TglLahir, JK, Plant, Dept, Grup, Paket
		colOffset := 0
		if len(row) >= 9 {
			// Check if first column is a number (sequence number)
			firstCol := strings.TrimSpace(row[0])
			if _, err := strconv.Atoi(firstCol); err == nil {
				colOffset = 1 // Skip sequence number column
			}
		}

		if len(row) < 8-colOffset {
			result.Invalid++
			result.Rows = append(result.Rows, PreviewRow{
				RowNum: rowNum,
				Error:  fmt.Sprintf("Insufficient columns (got %d, need 8)", len(row)),
			})
			continue
		}

		nip := strings.TrimSpace(row[0+colOffset])
		namaLengkap := strings.TrimSpace(row[1+colOffset])
		tanggalLahirStr := strings.TrimSpace(row[2+colOffset])
		jenisKelaminRaw := strings.TrimSpace(row[3+colOffset])
		plant := strings.TrimSpace(row[4+colOffset])
		deptBagian := strings.TrimSpace(row[5+colOffset])
		grup := ""
		paketMCU := ""
		
		if len(row) > 6+colOffset {
			grup = strings.TrimSpace(row[6+colOffset])
		}
		if len(row) > 7+colOffset {
			paketMCU = strings.TrimSpace(row[7+colOffset])
		}

		previewRow := PreviewRow{
			RowNum:       rowNum,
			NIP:          nip,
			NamaLengkap:  namaLengkap,
			JenisKelamin: jenisKelaminRaw,
			TanggalLahir: tanggalLahirStr,
			Plant:        plant,
			DeptBagian:   deptBagian,
			Grup:         grup,
			PaketMCU:     paketMCU,
		}

		// Validate row
		if nip == "" {
			previewRow.Error = "NIP is required"
			result.Invalid++
			result.Rows = append(result.Rows, previewRow)
			continue
		}

		if namaLengkap == "" {
			previewRow.Error = "Nama Lengkap is required"
			result.Invalid++
			result.Rows = append(result.Rows, previewRow)
			continue
		}

		// Validate and normalize jenis_kelamin
		jk := strings.ToUpper(jenisKelaminRaw)
		if jk == "L" || jk == "LAKI-LAKI" || jk == "MALE" {
			previewRow.JenisKelamin = "L"
		} else if jk == "P" || jk == "PEREMPUAN" || jk == "FEMALE" {
			previewRow.JenisKelamin = "P"
		} else {
			previewRow.Error = fmt.Sprintf("Invalid Jenis Kelamin: '%s' (use L/P/Laki-laki/Perempuan)", jenisKelaminRaw)
			result.Invalid++
			result.Rows = append(result.Rows, previewRow)
			continue
		}

		// Validate tanggal_lahir
		if tanggalLahirStr == "" {
			previewRow.Error = "Tanggal Lahir is required"
			result.Invalid++
			result.Rows = append(result.Rows, previewRow)
			continue
		}

		result.Valid++
		result.Rows = append(result.Rows, previewRow)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "result": result})
}

// ImportPatients - Save previewed data to database
func ImportPatients(c *gin.Context) {
	var req ImportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	result := ImportResult{
		Total:      len(req.Rows),
		Success:    0,
		Failed:     0,
		FailedRows: []string{},
	}

	userID, _ := c.Get("userID")

	for _, row := range req.Rows {
		if row.Error != "" {
			result.Failed++
			result.FailedRows = append(result.FailedRows, fmt.Sprintf("Row %d: %s", row.RowNum, row.Error))
			continue
		}

		// Parse tanggal_lahir dengan smart detection
		// Format bisa: DD-MM-YY, MM-DD-YY (US), YYYY-MM-DD, dll
		var tanggalLahir time.Time
		var parseErr error
		
		// Coba parse dengan berbagai format
		dateFormats := []string{
			"2006-01-02",    // YYYY-MM-DD
			"02/01/2006",    // DD/MM/YYYY
			"02-01-2006",    // DD-MM-YYYY
			"02/01/06",      // DD/MM/YY
			"02-01-06",      // DD-MM-YY
			"01/02/06",      // MM/DD/YY
			"01-02-06",      // MM-DD-YY (US)
			"02-Jan-2006",   // DD-Mon-YYYY
			"2006/01/02",    // YYYY/MM/DD
		}
		
		// First, try to detect MM-DD-YY vs DD-MM-YY based on values
		parts := strings.Split(row.TanggalLahir, "-")
		if len(parts) == 3 && len(parts[0]) == 2 && len(parts[1]) == 2 && len(parts[2]) == 2 {
			// Format XX-XX-YY
			first, _ := strconv.Atoi(parts[0])
			second, _ := strconv.Atoi(parts[1])
			
			// Jika second > 12, pasti DD-MM-YY (bulan tidak mungkin > 12)
			// Jika first > 12, pasti MM-DD-YY (tanggal tidak mungkin > 31)
			if second > 12 {
				// DD-MM-YY
				tanggalLahir, parseErr = time.Parse("02-01-06", row.TanggalLahir)
			} else if first > 12 {
				// MM-DD-YY (US format)
				tanggalLahir, parseErr = time.Parse("01-02-06", row.TanggalLahir)
			} else {
				// Ambigu (keduanya <= 12), coba DD-MM-YY dulu (format Indonesia)
				tanggalLahir, parseErr = time.Parse("02-01-06", row.TanggalLahir)
			}
		} else {
			// Try all formats
			for _, format := range dateFormats {
				tanggalLahir, parseErr = time.Parse(format, row.TanggalLahir)
				if parseErr == nil {
					break
				}
			}
		}
		
		if parseErr != nil {
			// Try Excel serial date
			if excelDate, err := strconv.ParseFloat(row.TanggalLahir, 64); err == nil {
				excelRef := time.Date(1899, 12, 30, 0, 0, 0, 0, time.UTC)
				tanggalLahir = excelRef.AddDate(0, 0, int(excelDate))
				parseErr = nil
			}
		}
		
		if parseErr != nil {
			result.Failed++
			result.FailedRows = append(result.FailedRows, fmt.Sprintf("Row %d: Invalid Tanggal Lahir format '%s'", row.RowNum, row.TanggalLahir))
			continue
		}

		// Check if NIP already exists - UPSERT logic
		var existingPatient models.Patient
		dbResult := models.DB.Where("nip = ?", row.NIP).First(&existingPatient)
		
		if dbResult.Error == nil {
			// NIP exists, UPDATE the patient
			updates := map[string]interface{}{
				"nama_lengkap":  row.NamaLengkap,
				"tanggal_lahir": tanggalLahir,
				"jenis_kelamin": row.JenisKelamin,
				"plant":         row.Plant,
				"dept_bagian":   row.DeptBagian,
				"grup":          row.Grup,
				"paket_mcu":     row.PaketMCU,
				"updated_at":    time.Now(),
			}

			if err := models.DB.Model(&existingPatient).Updates(updates).Error; err != nil {
				result.Failed++
				result.FailedRows = append(result.FailedRows, fmt.Sprintf("Row %d: Failed to update - %v", row.RowNum, err))
				continue
			}

			result.Success++
		} else {
			// NIP doesn't exist, CREATE new patient
			patient := models.Patient{
				NIP:          row.NIP,
				NamaLengkap:  row.NamaLengkap,
				TanggalLahir: tanggalLahir,
				JenisKelamin: row.JenisKelamin,
				Plant:        row.Plant,
				DeptBagian:   row.DeptBagian,
				Grup:         row.Grup,
				PaketMCU:     row.PaketMCU,
			}

			if err := models.DB.Create(&patient).Error; err != nil {
				result.Failed++
				result.FailedRows = append(result.FailedRows, fmt.Sprintf("Row %d: Failed to save - %v", row.RowNum, err))
				continue
			}

			result.Success++
		}
	}

	status := http.StatusOK
	if result.Failed > 0 {
		status = http.StatusPartialContent
	}

	c.JSON(status, gin.H{
		"success": true,
		"result":  result,
	})
}
