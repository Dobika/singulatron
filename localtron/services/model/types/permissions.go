/**
 * @license
 * Copyright (c) The Authors (see the AUTHORS file)
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPLv3) for personal, non-commercial use.
 * You may obtain a copy of the AGPL v3.0 at https://www.gnu.org/licenses/agpl-3.0.html.
 */

package modeltypes

import (
	usertypes "github.com/singulatron/singulatron/localtron/services/user/types"
)

var PermissionModelCreate = usertypes.Permission{
	Id:   "model.create",
	Name: "Model Create",
}

var PermissionModelView = usertypes.Permission{
	Id:   "model.view",
	Name: "Model View",
}

var PermissionModelEdit = usertypes.Permission{
	Id:   "model.edit",
	Name: "Model Edit",
}

var PermissionModelDelete = usertypes.Permission{
	Id:   "model.delete",
	Name: "Model Delete",
}

var PermissionModelStream = usertypes.Permission{
	Id:   "model.stream",
	Name: "Model Stream",
}

var ModelPermissions = []usertypes.Permission{
	PermissionModelCreate,
	PermissionModelView,
	PermissionModelEdit,
	PermissionModelDelete,
	PermissionModelStream,
}
