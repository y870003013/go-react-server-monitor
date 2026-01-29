package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"server-monitor/agent/internal/model"
)

type Client struct {
	serverURL string
	client    *http.Client
}

func NewClient(serverURL string) *Client {
	return &Client{
		serverURL: serverURL,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (c *Client) Report(state model.HostState) error {
	jsonData, err := json.Marshal(state)
	if err != nil {
		return fmt.Errorf("marshal error: %v", err)
	}

	resp, err := c.client.Post(c.serverURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("post error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("server returned status: %d", resp.StatusCode)
	}

	log.Printf("Reported: CPU=%.1f%%, Mem=%.1f%%, Uptime=%ds, Load1=%.2f",
		state.CPU, state.Memory, state.Uptime, state.Load1)
	return nil
}
