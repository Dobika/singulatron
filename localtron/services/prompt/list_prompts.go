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
package promptservice

import (
	"time"

	"github.com/singulatron/singulatron/localtron/datastore"
	prompttypes "github.com/singulatron/singulatron/localtron/services/prompt/types"
)

type ListPromptOptions struct {
	CreatedAfter time.Time
	// or relationship
	Statuses     []prompttypes.PromptStatus
	LastRunAfter time.Time
	Desc         bool
	After        time.Time
	Count        bool
}

func (p *PromptService) ListPrompts(options *ListPromptOptions) ([]*prompttypes.Prompt, int64, error) {
	q := p.promptsStore.Query(
		datastore.Equal(datastore.Field("status"), options.Statuses),
	).Limit(20).OrderBy("createdAt", options.Desc)

	if !options.After.IsZero() {
		q = q.After(options.After)
	}

	var count int64
	if options.Count {
		var err error
		count, err = q.Count()
		if err != nil {
			return nil, 0, err
		}
	}

	res, err := q.Find()
	if err != nil {
		return nil, 0, err
	}

	return res, count, nil
}
