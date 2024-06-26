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
package promptendpoints

import (
	"encoding/json"
	"net/http"

	promptservice "github.com/singulatron/singulatron/localtron/services/prompt"
	prompttypes "github.com/singulatron/singulatron/localtron/services/prompt/types"
	userservice "github.com/singulatron/singulatron/localtron/services/user"
)

func List(
	w http.ResponseWriter,
	r *http.Request,
	userService *userservice.UserService,
	promptService *promptservice.PromptService,
) {
	err := userService.IsAuthorized(prompttypes.PermissionPromptView.Id, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	req := prompttypes.ListPromptsRequest{}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `invalid JSON`, http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	prompts, err := promptService.ListPrompts(&promptservice.ListPromptOptions{
		Statuses: []prompttypes.PromptStatus{
			prompttypes.PromptStatusRunning,
			prompttypes.PromptStatusScheduled,
		},
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	bs, _ := json.Marshal(prompttypes.ListPromptsResponse{
		Prompts: prompts,
	})
	w.Write(bs)
}
