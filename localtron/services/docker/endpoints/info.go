/**
 * @license
 * Copyright (c) The Authors (see the AUTHORS file)
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPLv3) for personal, non-commercial use.
 * You may obtain a copy of the AGPL v3.0 at https://www.gnu.org/licenses/agpl-3.0.html.
 */
package dockerendpoints

import (
	"encoding/json"
	"net/http"

	dockerservice "github.com/singulatron/singulatron/localtron/services/docker"
	dockertypes "github.com/singulatron/singulatron/localtron/services/docker/types"
	userservice "github.com/singulatron/singulatron/localtron/services/user"
)

func Info(
	w http.ResponseWriter,
	req *http.Request,
	userService *userservice.UserService,
	dm *dockerservice.DockerService,
) {
	err := userService.IsAuthorized(dockertypes.PermissionDockerView.Id, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	di, err := dm.Info()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, _ := json.Marshal(map[string]any{
		"info": di,
	})
	w.Write(jsonData)
}
