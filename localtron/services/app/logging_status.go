/**
 * @license
 * Copyright (c) The Authors (see the AUTHORS file)
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPLv3) for personal, non-commercial use.
 * You may obtain a copy of the AGPL v3.0 at https://www.gnu.org/licenses/agpl-3.0.html.
 */
package appservice

import (
	"github.com/pkg/errors"

	apptypes "github.com/singulatron/singulatron/localtron/services/app/types"
)

func (a *AppService) LoggingStatus() (apptypes.LoggingStatus, error) {
	conf, err := a.configService.GetConfig()
	if err != nil {
		return apptypes.LoggingStatus{}, errors.Wrap(err, "cannot get config")
	}

	return apptypes.LoggingStatus{
		Enabled: !conf.App.LoggingDisabled,
	}, nil
}
