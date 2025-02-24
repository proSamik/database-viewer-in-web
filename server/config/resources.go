package config

// SystemResources defines system-wide resource limits and configurations
type SystemResources struct {
	CPUCores              int     `json:"cpu_cores"`
	MaxConnections        int     `json:"max_connections"`
	MaxIdleConnections    int     `json:"max_idle_connections"`
	MaxConcurrentRequests int     `json:"max_concurrent_requests"`
	QueryQueueSize        int     `json:"query_queue_size"`
	RateLimit             float64 `json:"rate_limit"`
	CacheSize             int     `json:"cache_size"`
}

// NewSystemResources creates a new SystemResources instance with default values
func NewSystemResources() *SystemResources {
	return &SystemResources{
		CPUCores:              2,
		MaxConnections:        7, // ((2 cores * 2) + 1) / (1 - 0.3)
		MaxIdleConnections:    3,
		MaxConcurrentRequests: 14,   // 2 * MaxConnections
		QueryQueueSize:        21,   // 3 * MaxConnections
		RateLimit:             10.0, // requests per second
		CacheSize:             512,  // MB
	}
}
