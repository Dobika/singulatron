/**
 * @license
 * Copyright (c) The Authors (see the AUTHORS file)
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPLv3) for personal, non-commercial use.
 * You may obtain a copy of the AGPL v3.0 at https://www.gnu.org/licenses/agpl-3.0.html.
 */

package generictypes

import (
	usertypes "github.com/singulatron/singulatron/localtron/services/user/types"
)

var PermissionGenericCreate = usertypes.Permission{
	Id:   "generic.create",
	Name: "Generic Create",
}

var PermissionGenericView = usertypes.Permission{
	Id:   "generic.view",
	Name: "Generic View",
}

var PermissionGenericEdit = usertypes.Permission{
	Id:   "generic.edit",
	Name: "Generic Edit",
}

var PermissionGenericDelete = usertypes.Permission{
	Id:   "generic.delete",
	Name: "Generic Delete",
}

var PermissionGenericStream = usertypes.Permission{
	Id:   "generic.stream",
	Name: "Generic Stream",
}

var GenericPermissions = []usertypes.Permission{
	PermissionGenericCreate,
	PermissionGenericView,
	PermissionGenericEdit,
	PermissionGenericDelete,
	PermissionGenericStream,
}
