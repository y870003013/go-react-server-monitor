package main

import (
	"flag"
	"log"
	"os"
	"time"

	"gopkg.in/yaml.v3"

	"server-monitor/agent/internal/client"
	"server-monitor/agent/internal/monitor"
)

type Config struct {
	ServerURL string `yaml:"server_url"`
	Interval  int    `yaml:"interval"` // In seconds
}

func main() {
	// 1. Defaults
	config := Config{
		ServerURL: "http://localhost:8080/report",
		Interval:  3,
	}

	// 2. Parse Flags
	configFile := flag.String("c", "agent.yaml", "Path to config file")
	serverURL := flag.String("server", "", "Server URL (overrides config)")
	interval := flag.Int("interval", 0, "Report interval in seconds (overrides config)")
	flag.Parse()

	// 3. Load Config File (if exists)
	if *configFile != "" {
		if _, err := os.Stat(*configFile); err == nil {
			log.Printf("Loading config from %s", *configFile)
			file, err := os.Open(*configFile)
			if err == nil {
				defer file.Close()
				var fileConfig Config
				if err := yaml.NewDecoder(file).Decode(&fileConfig); err == nil {
					// Merge: only override if value provided in file
					if fileConfig.ServerURL != "" {
						config.ServerURL = fileConfig.ServerURL
					}
					if fileConfig.Interval > 0 {
						config.Interval = fileConfig.Interval
					}
				} else {
					log.Printf("Warning: Failed to parse config file: %v", err)
				}
			} else {
				log.Printf("Warning: Failed to open config file: %v", err)
			}
		}
	}

	// 4. Override with Flags (if provided)
	if *serverURL != "" {
		config.ServerURL = *serverURL
	}
	if *interval > 0 {
		config.Interval = *interval
	}

	log.Println("Agent starting...")
	log.Printf("Server URL: %s", config.ServerURL)
	log.Printf("Interval: %d seconds", config.Interval)

	// Initialize components
	m := monitor.NewMonitor()
	c := client.NewClient(config.ServerURL)

	// Main Loop
	ticker := time.NewTicker(time.Duration(config.Interval) * time.Second)
	defer ticker.Stop()

	// Run once immediately
	run(m, c)

	for range ticker.C {
		run(m, c)
	}
}

func run(m *monitor.Monitor, c *client.Client) {
	state := m.Collect()
	if err := c.Report(state); err != nil {
		log.Printf("Error reporting state: %v", err)
	}
}
