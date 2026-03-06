package main

import (
	"log"
	"mcu-track/config"
	"mcu-track/handlers"
	"mcu-track/middleware"
	"mcu-track/models"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Initialize database
	models.InitDB()

	// Auto migrate models
	models.AutoMigrate()

	// Set Gin mode based on environment
	if config.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		// Allow both localhost and network IP
		if origin == "http://localhost:3000" || origin == "http://192.168.2.253:3000" || origin == "http://127.0.0.1:3000" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Public routes
	auth := r.Group("/api/auth")
	{
		auth.POST("/login", handlers.Login)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Auth
		protected.POST("/logout", handlers.Logout)
		protected.GET("/me", handlers.GetCurrentUser)

		// Patients
		patients := protected.Group("/patients")
		{
			patients.GET("", handlers.GetPatients)
			patients.POST("", handlers.CreatePatient)
			patients.GET("/:id", handlers.GetPatientByID)
			patients.PUT("/:id", handlers.UpdatePatient)
			patients.POST("/preview", handlers.PreviewPatients)
			patients.POST("/import", handlers.ImportPatients)
		}

		// Visits
		visits := protected.Group("/visits")
		{
			visits.GET("", handlers.GetVisits)
			visits.POST("", handlers.CreateVisit)
			visits.GET("/:id", handlers.GetVisitByID)
			visits.GET("/:id/workflow", handlers.GetVisitWorkflow)
			visits.PATCH("/:id/status", handlers.UpdateVisitStatus)
			visits.PATCH("/steps/:stepId/status", handlers.UpdateStepStatus)
			visits.GET("/dashboard/stats", handlers.GetDashboardStats)
		}

		// Packages
		packages := protected.Group("/packages")
		{
			packages.GET("", handlers.GetPackages)
			packages.POST("", handlers.CreatePackage)
			packages.GET("/:id", handlers.GetPackageByID)
			packages.PATCH("/:id/toggle", handlers.TogglePackageStatus)
		}

		// Audit logs (Admin only)
		admin := protected.Group("/admin")
		admin.Use(middleware.RequireRole("ADMIN"))
		{
			admin.GET("/audit-logs", handlers.GetAuditLogs)
			
			// User management
			admin.GET("/users", handlers.GetUsers)
			admin.GET("/users/:id", handlers.GetUserByID)
			admin.POST("/users", handlers.CreateUser)
			admin.PATCH("/users/:id/toggle", handlers.ToggleUserStatus)
		}
	}

	// Start server
	port := config.GetConfig().ServerPort
	log.Printf("Starting MCUTrack API server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
