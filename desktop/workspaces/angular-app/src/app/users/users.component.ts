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
import { Component, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import { User, UserService } from '../services/user.service';
import { first } from 'rxjs';
import { ToastController, IonicModule } from '@ionic/angular';
import { TranslatePipe } from '../translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgIf } from '@angular/common';
import { CenteredComponent } from '../components/centered/centered.component';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { PageComponent } from '../components/page/page.component';
import { IconMenuComponent } from '../components/icon-menu/icon-menu.component';

interface UserVisible extends User {
	visible?: boolean;
}

@Component({
	selector: 'app-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.scss'],
	standalone: true,
	imports: [
		PageComponent,
		IconMenuComponent,
		CenteredComponent,
		IonicModule,
		NgFor,
		FormsModule,
		ReactiveFormsModule,
		NgIf,
		TranslateModule,
		TranslatePipe,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
	users: UserVisible[] = [];
	filteredUsers: UserVisible[] = [];
	private userForms: Map<string, FormGroup> = new Map();
	searchText = '';

	constructor(
		private fb: FormBuilder,
		private userService: UserService,
		private toast: ToastController,
		private cd: ChangeDetectorRef
	) {
		this.userForms = new Map();
		this.userService.user$.pipe(first()).subscribe(() => {
			this.loggedInInit();
		});
	}

	async ngOnInit() {
		await this.loggedInInit();
	}

	async loggedInInit() {
		const rsp = await this.userService.getUsers();
		this.users = rsp.users;
		this.filteredUsers = [...this.users];
		this.userForms?.clear();

		for (const user of this.users) {
			this.userForms.set(user.id!, this.createUserForm(user));
		}
		this.cd.markForCheck();
	}

	createUserForm(user: UserVisible): FormGroup {
		return this.fb.group({
			name: [user.name, Validators.required],
			email: [user.email, [Validators.required]],
			password: [''],
			passwordConfirmation: [''],
			createdAt: [{ value: user.createdAt, disabled: true }],
			updatedAt: [{ value: user.updatedAt, disabled: true }],
			visible: [user.visible || false],
		});
	}

	getUserForm(userId: string): FormGroup {
		return this.userForms.get(userId)!;
	}

	async saveUser(userId: string) {
		const userForm = this.getUserForm(userId);
		if (userForm.invalid) {
			return;
		}

		const { name, email, password, passwordConfirmation } = userForm.value;

		if (password && password !== passwordConfirmation) {
			const toast = await this.toast.create({
				message: 'Passwords do not match',
				duration: 5000,
				color: 'danger',
				cssClass: 'white-text',
				position: 'middle',
			});
			toast.present();
			return;
		}

		try {
			let toastMessage = `Profile ${name} saved`;
			await this.userService.saveProfile(email, name);

			if (password) {
				toastMessage += ' and password changed';
				await this.userService.changePassword(email, '', password);
			}

			const toast = await this.toast.create({
				color: 'secondary',
				message: toastMessage,
				duration: 5000,
				position: 'middle',
			});
			toast.present();

			this.loggedInInit();
		} catch (error) {
			let errorMessage = 'An unexpected error occurred';
			try {
				errorMessage = (JSON.parse(error as any) as any)?.error;
			} catch {}

			const toast = await this.toast.create({
				color: 'danger',
				cssClass: 'white-text',
				message: errorMessage,
				duration: 5000,
				position: 'middle',
			});
			toast.present();
		}
	}

	filterUsers(searchText: string | null | undefined) {
		if (!searchText) {
			this.filteredUsers = this.users;
			this.cd.markForCheck();
			return;
		}
		this.searchText = searchText.trim().toLowerCase();
		this.filteredUsers = this.users.filter(
			(user) =>
				user.name?.toLowerCase().includes(this.searchText) ||
				user.email?.toLowerCase().includes(this.searchText)
		);

		this.cd.markForCheck();
	}

	async deleteUser($event: any, userId: string) {
		$event.stopPropagation();

		try {
			await this.userService.deleteUser(userId);

			const toastMessage = `User ${name} deleted`;

			const toast = await this.toast.create({
				color: 'secondary',
				message: toastMessage,
				duration: 5000,
				position: 'middle',
			});
			toast.present();

			this.loggedInInit();
		} catch (error) {
			let errorMessage = 'An unexpected error occurred';
			try {
				errorMessage = (JSON.parse(error as any) as any)?.error;
			} catch {}

			const toast = await this.toast.create({
				color: 'danger',
				cssClass: 'white-text',
				message: errorMessage,
				duration: 5000,
				position: 'middle',
			});
			toast.present();
		}
	}

	trackById(_: number, message: { id?: string }): string {
		return message.id || '';
	}
}
