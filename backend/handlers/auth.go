package handlers

import (
	"net/http"

	"mcu-track/middleware"
	"mcu-track/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Success bool   `json:"success"`
	User    *UserDTO `json:"user,omitempty"`
	Error   string `json:"error,omitempty"`
}

type UserDTO struct {
	ID       string      `json:"id"`
	Email    string      `json:"email"`
	Name     string      `json:"name"`
	Role     models.Role `json:"role"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, LoginResponse{Error: "Invalid request format"})
		return
	}

	// Find user
	var user models.User
	if err := models.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		logAudit(c, "", "", models.AuditActionLogin, models.EntityTypeUser, req.Email, nil, map[string]interface{}{
			"success": false,
			"reason":  "User not found",
		})
		c.JSON(http.StatusUnauthorized, LoginResponse{Error: "Invalid email or password"})
		return
	}

	// Check if user is active
	if !user.IsActive {
		logAudit(c, user.ID, "", models.AuditActionLogin, models.EntityTypeUser, user.ID, nil, map[string]interface{}{
			"success": false,
			"reason":  "User inactive",
		})
		c.JSON(http.StatusForbidden, LoginResponse{Error: "Account is deactivated"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		logAudit(c, user.ID, "", models.AuditActionLogin, models.EntityTypeUser, user.ID, nil, map[string]interface{}{
			"success": false,
			"reason":  "Invalid password",
		})
		c.JSON(http.StatusUnauthorized, LoginResponse{Error: "Invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, LoginResponse{Error: "Failed to generate token"})
		return
	}

	// Set cookie
	c.SetCookie("session", token, 8*60*60, "/", "", false, true) // 8 hours

	// Log successful login
	logAudit(c, user.ID, "", models.AuditActionLogin, models.EntityTypeUser, user.ID, nil, map[string]interface{}{
		"success": true,
		"email":   user.Email,
	})

	c.JSON(http.StatusOK, LoginResponse{
		Success: true,
		User: &UserDTO{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
			Role:  user.Role,
		},
	})
}

func Logout(c *gin.Context) {
	userID, _ := c.Get("userID")
	if userID != nil {
		logAudit(c, userID.(string), "", models.AuditActionLogout, models.EntityTypeUser, userID.(string), nil, nil)
	}

	c.SetCookie("session", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("userID")
	email, _ := c.Get("email")
	role, _ := c.Get("role")

	var user models.User
	if err := models.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": email,
		"name":  user.Name,
		"role":  role,
	})
}

// Helper function for audit logging
func logAudit(c *gin.Context, userID, visitID string, action models.AuditAction, entityType models.EntityType, entityID string, oldValue, newValue interface{}) {
	oldValueJSON := ""
	newValueJSON := ""

	// Simple JSON serialization (in production, use proper JSON marshal)
	if oldValue != nil {
		// Convert to JSON string
		oldValueJSON = interfaceToJSON(oldValue)
	}
	if newValue != nil {
		newValueJSON = interfaceToJSON(newValue)
	}

	audit := models.AuditLog{
		UserID:     &userID,
		EntityType: entityType,
		EntityID:   entityID,
		Action:     action,
		OldValue:   oldValueJSON,
		NewValue:   newValueJSON,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}

	if visitID != "" {
		audit.VisitID = &visitID
	}

	models.DB.Create(&audit)
}
