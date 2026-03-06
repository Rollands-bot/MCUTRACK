package handlers

import (
	"net/http"
	"time"

	"mcu-track/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type CreateUserRequest struct {
	Username string      `json:"username" binding:"required"`
	Password string      `json:"password" binding:"required,min=6"`
	Name     string      `json:"name" binding:"required"`
	Role     models.Role `json:"role" binding:"required"`
	IsActive bool        `json:"isActive"`
}

type UserResponse struct {
	ID        string      `json:"id"`
	Username  string      `json:"username"`
	Name      string      `json:"name"`
	Role      models.Role `json:"role"`
	IsActive  bool        `json:"isActive"`
	CreatedAt time.Time   `json:"createdAt"`
}

func GetUsers(c *gin.Context) {
	var users []models.User

	if err := models.DB.Select("id, username, name, role, is_active, created_at").Order("created_at DESC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func GetUserByID(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := models.DB.Select("id, username, name, role, is_active, created_at").First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	// Check if username already exists
	var existing models.User
	if err := models.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Name:     req.Name,
		Role:     req.Role,
		IsActive: req.IsActive,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	logAudit(c, userID.(string), "", models.AuditActionCreate, models.EntityTypeUser, user.ID, nil, map[string]interface{}{
		"username": user.Username,
		"name":     user.Name,
		"role":     user.Role,
	})

	c.JSON(http.StatusCreated, UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Name:      user.Name,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	})
}

func ToggleUserStatus(c *gin.Context) {
	id := c.Param("id")

	userID, _ := c.Get("userID")

	var user models.User
	if err := models.DB.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Prevent deactivating yourself
	if id == userID.(string) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot deactivate your own account"})
		return
	}

	// Toggle status
	if err := models.DB.Model(&user).Update("is_active", !user.IsActive).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	logAudit(c, userID.(string), "", models.AuditActionStatusChange, models.EntityTypeUser, user.ID, map[string]interface{}{
		"is_active": !user.IsActive,
	}, nil)

	c.JSON(http.StatusOK, gin.H{"success": true, "user": UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Name:      user.Name,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}})
}
