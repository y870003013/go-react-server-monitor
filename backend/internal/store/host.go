package store

import (
	"server-monitor/backend/internal/model"
	"sync"
)

type Store struct {
	hosts sync.Map
}

func NewStore() *Store {
	return &Store{}
}

func (s *Store) Save(state model.HostState) {
	s.hosts.Store(state.HostID, state)
}

func (s *Store) Get(hostID string) (model.HostState, bool) {
	val, ok := s.hosts.Load(hostID)
	if !ok {
		return model.HostState{}, false
	}
	return val.(model.HostState), true
}

func (s *Store) GetAll() []model.HostState {
	var list []model.HostState
	s.hosts.Range(func(key, value interface{}) bool {
		list = append(list, value.(model.HostState))
		return true
	})
	return list
}
