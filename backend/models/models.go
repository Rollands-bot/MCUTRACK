package models

import (
	"log"
	"mcu-track/config"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// User model
type User struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email     string    `gorm:"uniqueIndex;not null"`
	Password  string    `gorm:"not null"`
	Name      string    `gorm:"not null"`
	Role      Role      `gorm:"type:varchar(20);not null;default:'NURSE'"`
	IsActive  bool      `gorm:"default:true"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	AuditLogs []AuditLog  `gorm:"foreignKey:UserID"`
	Visits    []Visit     `gorm:"foreignKey:AssignedDoctorID;constraint:OnDelete:SET NULL"`
}

type Role string

const (
	RoleAdmin     Role = "ADMIN"
	RoleNurse     Role = "NURSE"
	RoleLab       Role = "LAB"
	RoleRadiology Role = "RADIOLOGY"
	RoleDoctor    Role = "DOCTOR"
)

// Patient model
type Patient struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	MRN         string    `gorm:"uniqueIndex;not null"`
	FirstName   string    `gorm:"not null"`
	LastName    string    `gorm:"not null"`
	DateOfBirth time.Time `gorm:"not null"`
	Gender      Gender    `gorm:"type:varchar(10);not null"`
	Phone       string
	Email       string
	Company     string
	IDNumber    string
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	Visits []Visit `gorm:"foreignKey:PatientID"`
}

type Gender string

const (
	GenderMale   Gender = "MALE"
	GenderFemale Gender = "FEMALE"
	GenderOther  Gender = "OTHER"
)

// Visit model
type Visit struct {
	ID               string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	VisitNumber      string      `gorm:"uniqueIndex;not null"`
	PatientID        string      `gorm:"not null;index"`
	Patient          Patient     `gorm:"foreignKey:PatientID;constraint:OnDelete:RESTRICT"`
	PackageID        string      `gorm:"not null;index"`
	Package          MCUPackage  `gorm:"foreignKey:PackageID;constraint:OnDelete:RESTRICT"`
	Status           VisitStatus `gorm:"type:varchar(20);not null;default:'WAITING';index"`
	AssignedDoctorID *string     `gorm:"index"`
	AssignedDoctor   *User       `gorm:"foreignKey:AssignedDoctorID"`
	CheckInTime      time.Time   `gorm:"autoCreateTime"`
	CompletedAt      *time.Time
	FinalDecision    *FitStatus `gorm:"type:varchar(20)"`
	Notes            string
	CreatedAt        time.Time `gorm:"autoCreateTime"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime"`

	Steps   []VisitStep     `gorm:"foreignKey:VisitID"`
	Results []MedicalResult `gorm:"foreignKey:VisitID"`
	AuditLogs []AuditLog    `gorm:"foreignKey:VisitID"`
}

type VisitStatus string

const (
	VisitStatusWaiting    VisitStatus = "WAITING"
	VisitStatusInProgress VisitStatus = "IN_PROGRESS"
	VisitStatusDone       VisitStatus = "DONE"
	VisitStatusCancelled  VisitStatus = "CANCELLED"
)

type FitStatus string

const (
	FitStatusFit           FitStatus = "FIT"
	FitStatusFitWithConditions FitStatus = "FIT_WITH_CONDITIONS"
	FitStatusUnfit         FitStatus = "UNFIT"
	FitStatusPendingReview FitStatus = "PENDING_REVIEW"
)

// MCUPackage model
type MCUPackage struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string    `gorm:"not null"`
	Code        string    `gorm:"uniqueIndex;not null"`
	Description string
	IsActive    bool      `gorm:"default:true"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	Steps  []PackageStep `gorm:"foreignKey:PackageID"`
	Visits []Visit       `gorm:"foreignKey:PackageID"`
}

// PackageStep model
type PackageStep struct {
	ID           string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	PackageID    string     `gorm:"not null;index"`
	Package      MCUPackage `gorm:"foreignKey:PackageID;constraint:OnDelete:CASCADE"`
	Department   Department `gorm:"type:varchar(30);not null;index"`
	StepName     string     `gorm:"not null"`
	StepOrder    int        `gorm:"not null"`
	IsRequired   bool       `gorm:"default:true"`
	Instructions string
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`

	VisitSteps []VisitStep `gorm:"foreignKey:PackageStepID"`
}

type Department string

const (
	DepartmentNursing     Department = "NURSING"
	DepartmentLaboratory  Department = "LABORATORY"
	DepartmentRadiology   Department = "RADIOLOGY"
	DepartmentCardiology  Department = "CARDIOLOGY"
	DepartmentPulmonology Department = "PULMONOLOGY"
	DepartmentGeneralDoctor Department = "GENERAL_DOCTOR"
)

// VisitStep model
type VisitStep struct {
	ID            string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	VisitID       string     `gorm:"not null;index"`
	Visit         Visit      `gorm:"foreignKey:VisitID;constraint:OnDelete:CASCADE"`
	PackageStepID string     `gorm:"not null;index"`
	PackageStep   PackageStep `gorm:"foreignKey:PackageStepID;constraint:OnDelete:RESTRICT"`
	Status        StepStatus `gorm:"type:varchar(20);not null;default:'WAITING';index"`
	StartedAt     *time.Time
	CompletedAt   *time.Time
	PerformedBy   string
	Notes         string
	CreatedAt     time.Time `gorm:"autoCreateTime"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"`

	Results []MedicalResult `gorm:"foreignKey:VisitStepID"`

	// Unique constraint on visit_id and package_step_id
	__unique string `gorm:"uniqueIndex:idx_visit_package_step"`
}

type StepStatus string

const (
	StepStatusWaiting    StepStatus = "WAITING"
	StepStatusInProgress StepStatus = "IN_PROGRESS"
	StepStatusDone       StepStatus = "DONE"
	StepStatusSkipped    StepStatus = "SKIPPED"
)

// MedicalResult model
type MedicalResult struct {
	ID            string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	VisitID       string     `gorm:"not null;index"`
	Visit         Visit      `gorm:"foreignKey:VisitID;constraint:OnDelete:CASCADE"`
	VisitStepID   *string    `gorm:"index"`
	VisitStep     *VisitStep `gorm:"foreignKey:VisitStepID"`
	Department    Department `gorm:"type:varchar(30);not null;index"`
	ResultType    ResultType `gorm:"type:varchar(20);not null"`
	ResultData    string     `gorm:"type:jsonb;not null"` // JSON as string for GORM
	InterpretedBy string
	InterpretedAt *time.Time
	IsReviewed    bool      `gorm:"default:false"`
	ReviewedBy    string
	ReviewedAt    *time.Time
	CreatedAt     time.Time `gorm:"autoCreateTime"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"`
}

type ResultType string

const (
	ResultTypeNumeric    ResultType = "NUMERIC"
	ResultTypeText       ResultType = "TEXT"
	ResultTypeBoolean    ResultType = "BOOLEAN"
	ResultTypeStructured ResultType = "STRUCTURED"
	ResultTypeAttachment ResultType = "ATTACHMENT"
)

// AuditLog model
type AuditLog struct {
	ID         string       `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID     *string      `gorm:"index"`
	User       *User        `gorm:"foreignKey:UserID"`
	VisitID    *string      `gorm:"index"`
	Visit      *Visit       `gorm:"foreignKey:VisitID"`
	Action     AuditAction  `gorm:"type:varchar(30);not null;index"`
	EntityType EntityType   `gorm:"type:varchar(30);not null"`
	EntityID   string       `gorm:"not null"`
	OldValue   string       `gorm:"type:jsonb"` // JSON as string
	NewValue   string       `gorm:"type:jsonb"` // JSON as string
	IPAddress  string
	UserAgent  string
	CreatedAt  time.Time `gorm:"autoCreateTime;index"`
}

type AuditAction string

const (
	AuditActionCreate         AuditAction = "CREATE"
	AuditActionUpdate         AuditAction = "UPDATE"
	AuditActionDelete         AuditAction = "DELETE"
	AuditActionStatusChange   AuditAction = "STATUS_CHANGE"
	AuditActionResultSubmit   AuditAction = "RESULT_SUBMIT"
	AuditActionResultReview   AuditAction = "RESULT_REVIEW"
	AuditActionLogin          AuditAction = "LOGIN"
	AuditActionLogout         AuditAction = "LOGOUT"
	AuditActionPermissionDenied AuditAction = "PERMISSION_DENIED"
)

type EntityType string

const (
	EntityTypePatient     EntityType = "PATIENT"
	EntityTypeVisit       EntityType = "VISIT"
	EntityTypeVisitStep   EntityType = "VISIT_STEP"
	EntityTypeMedicalResult EntityType = "MEDICAL_RESULT"
	EntityTypeUser        EntityType = "USER"
	EntityTypePackage     EntityType = "PACKAGE"
)

func InitDB() {
	cfg := config.GetConfig()
	
	var logLevel logger.LogLevel
	if config.IsProduction() {
		logLevel = logger.Error
	} else {
		logLevel = logger.Info
	}

	var err error
	DB, err = gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established")
}

func AutoMigrate() {
	err := DB.AutoMigrate(
		&User{},
		&Patient{},
		&Visit{},
		&MCUPackage{},
		&PackageStep{},
		&VisitStep{},
		&MedicalResult{},
		&AuditLog{},
	)
	if err != nil {
		log.Fatalf("Failed to auto migrate: %v", err)
	}
	log.Println("Database migration completed")
}
