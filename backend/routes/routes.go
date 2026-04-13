package routes

import (
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"kbm-backend/handlers"
	"kbm-backend/middleware"
)

// SetupRouter returns the configured gin engine for both local and serverless use
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	allowList := []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}
	if allowedOrigins != "" {
		allowList = strings.Split(allowedOrigins, ",")
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowList,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Root status
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "Online",
			"message": "KBM Kos Management API is active 🏠",
			"docs": "/api",
		})
	})

	// Definition of all routes
	registerRoutes := func(rg *gin.RouterGroup) {
		// Public routes
		auth := rg.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
		}

		// Protected routes
		protected := rg.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Profile
			protected.GET("auth/profile", handlers.GetProfile)
			protected.PUT("auth/profile", handlers.UpdateProfile)
			protected.PUT("auth/profile/password", handlers.UpdatePassword)

			// Dashboard
			protected.GET("dashboard/stats", handlers.GetDashboardStats)

			// Ruangan
			protected.GET("ruangan", handlers.GetRuangan)
			protected.GET("fasilitas", handlers.GetFasilitas)

			// Booking
			protected.GET("booking/ruangan", handlers.GetBookingRuangan)
			protected.POST("booking/ruangan", handlers.CreateBookingRuangan)
			protected.DELETE("booking/ruangan/:id", handlers.CancelBookingRuangan)

			protected.GET("booking/fasilitas", handlers.GetBookingFasilitas)
			protected.POST("booking/fasilitas", handlers.CreateBookingFasilitas)
			protected.DELETE("booking/fasilitas/:id", handlers.CancelBookingFasilitas)

			// Laporan
			protected.GET("laporan", handlers.GetLaporan)
			protected.POST("laporan", handlers.CreateLaporan)

			// Tagihan
			protected.GET("tagihan", handlers.GetTagihan)
			protected.PUT("tagihan/:id/bayar", handlers.BayarTagihan)

			// Kas
			protected.GET("kas", handlers.GetKasTransaksi)
			protected.GET("kas/saldo", handlers.GetSaldoKas)
			protected.GET("kas/iuran", handlers.GetIuranKas)
			protected.PUT("kas/iuran/:id/bayar", handlers.BayarIuranKas)

			// Pengumuman
			protected.GET("pengumuman", handlers.GetPengumuman)

			// Penghuni
			protected.GET("penghuni", handlers.GetAllPenghuni)
		}

		// Admin only routes
		admin := rg.Group("/")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminOnly())
		{
			admin.POST("ruangan", handlers.CreateRuangan)
			admin.PUT("ruangan/:id", handlers.UpdateRuangan)
			admin.DELETE("ruangan/:id", handlers.DeleteRuangan)

			admin.POST("fasilitas", handlers.CreateFasilitas)
			admin.PUT("fasilitas/:id", handlers.UpdateFasilitas)
			admin.DELETE("fasilitas/:id", handlers.DeleteFasilitas)

			admin.PUT("booking/ruangan/:id/status", handlers.UpdateBookingRuanganStatus)
			admin.PUT("booking/fasilitas/:id/status", handlers.UpdateBookingFasilitasStatus)

			admin.PUT("laporan/:id", handlers.UpdateLaporan)

			admin.POST("tagihan", handlers.CreateTagihan)
			admin.PUT("tagihan/:id/verifikasi", handlers.VerifikasiTagihan)

			admin.POST("kas/transaksi", handlers.CreateKasTransaksi)
			admin.POST("kas/iuran", handlers.CreateIuranKas)
			admin.PUT("kas/iuran/:id/verifikasi", handlers.VerifikasiIuranKas)

			admin.POST("pengumuman", handlers.CreatePengumuman)
			admin.PUT("pengumuman/:id", handlers.UpdatePengumuman)
			admin.DELETE("pengumuman/:id", handlers.DeletePengumuman)
		}
	}

	// Register to both root and /api for maximum compatibility
	registerRoutes(r.Group("/"))
	registerRoutes(r.Group("/api"))

	return r
}
