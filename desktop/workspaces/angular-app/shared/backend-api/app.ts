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
export const logEndpoint = '/app/log';

export interface Log {
	level: string;
	time?: string;
	source: string;
	/* Anonymized client id, will be filled in Localtron */
	clientId?: string;
	platform?: string;
	message: string;
	fields: { [key: string]: any };
}

export interface LogRequest {
	logs: Log[];
}
