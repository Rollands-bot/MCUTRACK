package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	ServerPort  string
	JWTSecret   string
	Env         string
}

var currentConfig *Config

func LoadConfig() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	currentConfig = &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/mcutrack?sslmode=disable"),
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Env:         getEnv("ENV", "development"),
	}
}

func GetConfig() *Config {
	return currentConfig
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func IsProduction() bool {
	return currentConfig.Env == "production"
}

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}
