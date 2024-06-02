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
import { ReplaySubject } from 'rxjs';
import {
	OnGraphicsInfo,
	OnOSInfo,
} from 'shared-lib/models/event-request-response';

export class EventService {
	constructor() {}

	onGraphicsInfoSubject = new ReplaySubject<OnGraphicsInfo>(1);
	onGraphicsInfo$ = this.onGraphicsInfoSubject.asObservable();

	onOsInfoSubject = new ReplaySubject<OnOSInfo>(1);
	onOsInfo$ = this.onOsInfoSubject.asObservable();

	installRuntimeRequest = new ReplaySubject<void>(1);
	installRuntimeRequest$ = this.installRuntimeRequest.asObservable();

	onRuntimeInstallLogSubject = new ReplaySubject<string>(1);
	onRuntimeInstallLog$ = this.onRuntimeInstallLogSubject.asObservable();
}

export const eventService = new EventService();
