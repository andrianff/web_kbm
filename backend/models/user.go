package models

import (
	"time"
)

type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Username     string    `json:"username" gorm:"type:varchar(100);uniqueIndex;not null"`
	PasswordHash string    `json:"-" gorm:"not null"`
	Nama         string    `json:"nama" gorm:"not null"`
	NoHP         string    `json:"no_hp"`
	Email        string    `json:"email"`
	NoKamar      string    `json:"no_kamar"`
	Role         string    `json:"role" gorm:"default:penghuni"` // admin | penghuni
	CreatedAt    time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=4"`
	Nama     string `json:"nama" binding:"required"`
	NoHP     string `json:"no_hp"`
	Email    string `json:"email"`
	NoKamar  string `json:"no_kamar"`
}

type UpdateProfileRequest struct {
	Nama    string `json:"nama"`
	NoHP    string `json:"no_hp"`
	Email   string `json:"email"`
	NoKamar string `json:"no_kamar"`
}

type UpdatePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}
