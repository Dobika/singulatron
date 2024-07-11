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
import { Component } from '@angular/core';

import { NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageComponent } from '../components/page/page.component';
import { IconMenuComponent } from '../components/icon-menu/icon-menu.component';
import { CenteredComponent } from '../components/centered/centered.component';
import { DatePipe } from '@angular/common';
import { NodeService, Node } from '../services/node.service';
import { UserService } from '../services/user.service';

@Component({
	selector: 'app-nodes',
	standalone: true,
	imports: [
		CenteredComponent,
		PageComponent,
		IconMenuComponent,
		IonicModule,
		NgFor,
		NgIf,
		FormsModule,
		NgStyle,
		DatePipe,
	],
	templateUrl: './nodes.component.html',
	styleUrl: './nodes.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodesComponent {
	nodes: Node[] = [];
	error: string = '';

	constructor(
		private userService: UserService,
		private nodeService: NodeService,
		private cd: ChangeDetectorRef
	) {
		this.userService.user$.pipe(first()).subscribe(() => {
			this.initializeOnLogin();
		});
	}

	private async initializeOnLogin() {
		try {
			const rsp = await this.nodeService.nodesList({});
			// const rsp = fixture

			this.nodes = rsp.nodes;
			await this.nodeService.nodesList({});
		} catch (error) {
			this.error = JSON.parse(error as string)?.error;
		}
		this.cd.markForCheck();
	}
}

export const fixture = {
	nodes: [
		{
			hostname: 'a77916f6b8cd',
			gpus: [
				{
					id: 'a77916f6b8cd:0',
					intraNodeId: 0,
					name: 'NVIDIA GeForce RTX 3090',
					busId: '00000000:04:00.0',
					temperature: 46,
					performanceState: 'P8',
					powerUsage: 22.72,
					powerCap: 350,
					memoryUsage: 2328,
					memoryTotal: 24_576,
					gpuUtilization: 0,
					computeMode: 'Default',
				},
				{
					id: 'a77916f6b8cd:1',
					intraNodeId: 1,
					name: 'NVIDIA GeForce RTX 3090',
					busId: '00000000:2B:00.0',
					temperature: 50,
					performanceState: 'P8',
					powerUsage: 26.54,
					powerCap: 350,
					memoryUsage: 2200,
					memoryTotal: 24_576,
					gpuUtilization: 0,
					computeMode: 'Default',
				},
			],
		},
	],
};
