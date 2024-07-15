/**
 * @license
 * Copyright (c) The Authors (see the AUTHORS file)
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPLv3) for personal, non-commercial use.
 * You may obtain a copy of the AGPL v3.0 at https://www.gnu.org/licenses/agpl-3.0.html.
 */
package chatservice

import "github.com/singulatron/singulatron/localtron/datastore"

func (a *ChatService) DeleteThread(id string) error {
	return a.threadsStore.Query(
		datastore.Equal(datastore.Field("id"), id),
	).Delete()
}
