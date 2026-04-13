package routes

import (
	"os"
	"strings"

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
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Public routes
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
		}
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// Profile
		protected.GET("auth/profile", handlers.GetProfile)
		protected.PUT("auth/profile", handlers.UpdateProfile)
		protected.PUT("auth/profile/password", handlers.UpdatePassword)

		// Dashboard
		protected.GET("dashboard/stats", handlers.GetDashboardStats)

		// Ruangan (read: all, write: admin)
		protected.GET("ruangan", handlers.GetRuangan)

		// Fasilitas (read: all, write: admin)
		protected.GET("fasilitas", handlers.GetFasilitas)

		// Booking Ruangan
		protected.GET("booking/ruangan", handlers.GetBookingRuangan)
		protected.POST("booking/ruangan", handlers.CreateBookingRuangan)
		protected.DELETE("booking/ruangan/:id", handlers.CancelBookingRuangan)

		// Booking Fasilitas
		protected.GET("booking/fasilitas", handlers.GetBookingFasilitas)
		protected.POST("booking/fasilitas", handlers.CreateBookingFasilitas)
		protected.DELETE("booking/fasilitas/:id", handlers.CancelBookingFasilitas)

		// Laporan Kerusakan
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

		// Penghuni list
		protected.GET("penghuni", handlers.GetAllPenghuni)
	}

	// Admin only routes
	admin := api.Group("/")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminOnly())
	{
		// Ruangan management
		admin.POST("ruangan", handlers.CreateRuangan)
		admin.PUT("ruangan/:id", handlers.UpdateRuangan)
		admin.DELETE("ruangan/:id", handlers.DeleteRuangan)

		// Fasilitas management
		admin.POST("fasilitas", handlers.CreateFasilitas)
		admin.PUT("fasilitas/:id", handlers.UpdateFasilitas)
		admin.DELETE("fasilitas/:id", handlers.DeleteFasilitas)

		// Booking approval
		admin.PUT("booking/ruangan/:id/status", handlers.UpdateBookingRuanganStatus)
		admin.PUT("booking/fasilitas/:id/status", handlers.UpdateBookingFasilitasStatus)

		// Laporan management
		admin.PUT("laporan/:id", handlers.UpdateLaporan)

		// Tagihan management
		admin.POST("tagihan", handlers.CreateTagihan)
		admin.PUT("tagihan/:id/verifikasi", handlers.VerifikasiTagihan)

		// Kas management
		admin.POST("kas/transaksi", handlers.CreateKasTransaksi)
		admin.POST("kas/iuran", handlers.CreateIuranKas)
		admin.PUT("kas/iuran/:id/verifikasi", handlers.VerifikasiIuranKas)

		// Pengumuman management
		admin.POST("pengumuman", handlers.CreatePengumuman)
		admin.PUT("pengumuman/:id", handlers.UpdatePengumuman)
		admin.DELETE("pengumuman/:id", handlers.DeletePengumuman)
	}

	return r
}
