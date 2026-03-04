package main

import (
	"log"
	"mcu-track/config"
	"mcu-track/models"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Initialize database
	models.InitDB()

	// Auto migrate models
	models.AutoMigrate()

	// Seed users
	seedUsers()

	// Seed packages
	seedPackages()

	log.Println("Seeding completed successfully!")
}

func seedUsers() {
	users := []models.User{
		{
			Email:    "admin@hospital.com",
			Password: hashPassword("admin123"),
			Name:     "Administrator",
			Role:     models.RoleAdmin,
			IsActive: true,
		},
		{
			Email:    "nurse@hospital.com",
			Password: hashPassword("admin123"),
			Name:     "Nurse Station",
			Role:     models.RoleNurse,
			IsActive: true,
		},
		{
			Email:    "lab@hospital.com",
			Password: hashPassword("admin123"),
			Name:     "Lab Technician",
			Role:     models.RoleLab,
			IsActive: true,
		},
		{
			Email:    "radiology@hospital.com",
			Password: hashPassword("admin123"),
			Name:     "Radiology Dept",
			Role:     models.RoleRadiology,
			IsActive: true,
		},
		{
			Email:    "doctor@hospital.com",
			Password: hashPassword("admin123"),
			Name:     "Dr. House",
			Role:     models.RoleDoctor,
			IsActive: true,
		},
	}

	for _, user := range users {
		var existing models.User
		if err := models.DB.Where("email = ?", user.Email).First(&existing).Error; err != nil {
			// User not found, create
			if err := models.DB.Create(&user).Error; err != nil {
				log.Printf("Failed to create user %s: %v", user.Email, err)
			} else {
				log.Printf("Created user: %s (%s)", user.Email, user.Role)
			}
		} else {
			log.Printf("User already exists: %s", existing.Email)
		}
	}
}

func seedPackages() {
	packages := []models.MCUPackage{
		{
			Name:        "Basic Health Checkup",
			Code:        "BASIC",
			Description: "Essential health screening for general wellness",
			IsActive:    true,
		},
		{
			Name:        "Executive Checkup",
			Code:        "EXEC",
			Description: "Comprehensive health assessment for executives",
			IsActive:    true,
		},
		{
			Name:        "Pre-Employment MCU",
			Code:        "PREEMP",
			Description: "Standard pre-employment medical examination",
			IsActive:    true,
		},
	}

	for i := range packages {
		var existing models.MCUPackage
		if err := models.DB.Where("code = ?", packages[i].Code).First(&existing).Error; err != nil {
			// Package not found, create
			if err := models.DB.Create(&packages[i]).Error; err != nil {
				log.Printf("Failed to create package %s: %v", packages[i].Code, err)
			} else {
				log.Printf("Created package: %s", packages[i].Code)

				// Add steps based on package type
				addPackageSteps(packages[i].ID, packages[i].Code)
			}
		} else {
			log.Printf("Package already exists: %s", existing.Code)
		}
	}
}

func addPackageSteps(packageID string, packageCode string) {
	steps := getStepsForPackage(packageCode)

	for _, step := range steps {
		step.PackageID = packageID
		if err := models.DB.Create(&step).Error; err != nil {
			log.Printf("Failed to create step: %v", err)
		}
	}
}

func getStepsForPackage(packageCode string) []models.PackageStep {
	switch packageCode {
	case "BASIC":
		return []models.PackageStep{
			{Department: models.DepartmentNursing, StepName: "Registration & Vitals", StepOrder: 1, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Complete Blood Count", StepOrder: 2, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Urinalysis", StepOrder: 3, IsRequired: true},
			{Department: models.DepartmentRadiology, StepName: "Chest X-Ray", StepOrder: 4, IsRequired: false},
			{Department: models.DepartmentGeneralDoctor, StepName: "General Examination", StepOrder: 5, IsRequired: true},
		}
	case "EXEC":
		return []models.PackageStep{
			{Department: models.DepartmentNursing, StepName: "Registration & Vitals", StepOrder: 1, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Complete Blood Count", StepOrder: 2, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Lipid Profile", StepOrder: 3, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Liver Function Test", StepOrder: 4, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Kidney Function Test", StepOrder: 5, IsRequired: true},
			{Department: models.DepartmentRadiology, StepName: "Chest X-Ray", StepOrder: 6, IsRequired: true},
			{Department: models.DepartmentRadiology, StepName: "ECG", StepOrder: 7, IsRequired: true},
			{Department: models.DepartmentCardiology, StepName: "Cardiac Assessment", StepOrder: 8, IsRequired: false},
			{Department: models.DepartmentGeneralDoctor, StepName: "Final Assessment", StepOrder: 9, IsRequired: true},
		}
	case "PREEMP":
		return []models.PackageStep{
			{Department: models.DepartmentNursing, StepName: "Registration & Vitals", StepOrder: 1, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Drug Test", StepOrder: 2, IsRequired: true},
			{Department: models.DepartmentLaboratory, StepName: "Complete Blood Count", StepOrder: 3, IsRequired: true},
			{Department: models.DepartmentRadiology, StepName: "Chest X-Ray", StepOrder: 4, IsRequired: true},
			{Department: models.DepartmentGeneralDoctor, StepName: "Fitness Assessment", StepOrder: 5, IsRequired: true},
		}
	default:
		return []models.PackageStep{}
	}
}

func hashPassword(password string) string {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}
	return string(hashedBytes)
}
