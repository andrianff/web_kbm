package models

import (
	"time"
)

type Kas struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id"`
	User       User      `json:"user" gorm:"foreignKey:UserID"`
	Tipe       string    `json:"tipe" gorm:"not null"` // pemasukan | pengeluaran
	Jumlah     float64   `json:"jumlah" gorm:"not null"`
	Keterangan string    `json:"keterangan"`
	Kategori   string    `json:"kategori"` // iuran_bulanan|belanja|kegiatan|lainnya
	Tanggal    string    `json:"tanggal" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`
}

type KasTransaksiRequest struct {
	Tipe       string  `json:"tipe" binding:"required"`
	Jumlah     float64 `json:"jumlah" binding:"required"`
	Keterangan string  `json:"keterangan"`
	Kategori   string  `json:"kategori"`
	Tanggal    string  `json:"tanggal" binding:"required"`
}

type SaldoKas struct {
	TotalPemasukan  float64 `json:"total_pemasukan"`
	TotalPengeluaran float64 `json:"total_pengeluaran"`
	Saldo           float64 `json:"saldo"`
}
