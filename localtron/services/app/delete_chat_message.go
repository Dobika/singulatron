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

import "fmt"

func (a *AppService) DeleteChatMessage(id string) error {
	position := -1
	for i, chatMessage := range a.chatFile.Messages {
		if chatMessage.Id == id {
			position = i
		}
	}
	if position < 0 {
		return fmt.Errorf("cannot find chat message with id '%v'", id)
	}

	a.Mutex.Lock()
	a.chatFile.Messages = append(a.chatFile.Messages[:position], a.chatFile.Messages[position+1:]...)
	a.Mutex.Unlock()

	return a.saveChatFile()
}
