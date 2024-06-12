/**
 * @license
 * Copyright (c) The Authors (see the AUTHORS file)
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPLv3) for personal, non-commercial use.
 * You may obtain a copy of the AGPL v3.0 at https://www.gnu.org/licenses/agpl-3.0.html.
 *
 * For commercial use, a separate license must be obtained by purchasing from The Authors.
 * For commercial licensing inquiries, please contact The Authors listed in the AUTHORS file.
 */
package appservice

import (
	"os"
	"os/signal"
	"path"
	"sync"
	"syscall"
	"time"

	"github.com/pkg/errors"
	"github.com/singulatron/singulatron/localtron/lib"
	apptypes "github.com/singulatron/singulatron/localtron/services/app/types"
	configservice "github.com/singulatron/singulatron/localtron/services/config"
	firehoseservice "github.com/singulatron/singulatron/localtron/services/firehose"
	userservice "github.com/singulatron/singulatron/localtron/services/user"
)

type AppService struct {
	configService   *configservice.ConfigService
	userService     *userservice.UserService
	firehoseService *firehoseservice.FirehoseService

	LogBuffer   []apptypes.Log
	TriggerSend chan bool
	Timer       *time.Timer

	clientId string

	ThreadsFilePath  string
	MessagesFilePath string

	messagesMem *lib.MemoryStore[*apptypes.ChatMessage]
	threadsMem  *lib.MemoryStore[*apptypes.ChatThread]

	messagesFile *lib.StateManager[*apptypes.ChatMessage]
	threadsFile  *lib.StateManager[*apptypes.ChatThread]

	logMutex sync.Mutex
}

func NewAppService(
	cs *configservice.ConfigService,
	fs *firehoseservice.FirehoseService,
	userService *userservice.UserService,
) (*AppService, error) {
	ci, err := cs.GetClientId()
	if err != nil {
		return nil, errors.Wrap(err, "app service canno get client id")
	}

	mm := lib.NewMemoryStore[*apptypes.ChatMessage]()
	tm := lib.NewMemoryStore[*apptypes.ChatThread]()

	err = os.MkdirAll(path.Join(cs.ConfigDirectory, "data"), 0755)
	if err != nil {
		return nil, err
	}

	messagesPath := path.Join(cs.ConfigDirectory, "data", "messages")
	threadsPath := path.Join(cs.ConfigDirectory, "data", "threads")

	service := &AppService{
		configService:   cs,
		firehoseService: fs,
		userService:     userService,

		messagesMem: mm,
		threadsMem:  tm,

		messagesFile: lib.NewStateManager(mm, messagesPath),
		threadsFile:  lib.NewStateManager(tm, threadsPath),

		LogBuffer:   make([]apptypes.Log, 0),
		TriggerSend: make(chan bool, 1),
		Timer:       time.NewTimer(10 * time.Second),

		clientId: ci,
	}
	service.MessagesFilePath = messagesPath
	service.ThreadsFilePath = threadsPath

	err = service.loadChatFiles()
	if err != nil {
		return nil, err
	}

	err = service.registerPermissions()
	if err != nil {
		return nil, err
	}

	go service.messagesFile.PeriodicSaveState(2 * time.Second)
	go service.threadsFile.PeriodicSaveState(2 * time.Second)

	service.setupSignalHandler()
	return service, nil
}

func (a *AppService) setupSignalHandler() {
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-signals
		a.sendLogs()
		os.Exit(0)
	}()
}

func (a *AppService) loadChatFiles() error {
	err := a.messagesFile.LoadState()
	if err != nil {
		return err
	}
	return a.threadsFile.LoadState()
}