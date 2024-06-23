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
import {
	Component,
	ViewEncapsulation,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
	ChangeDetectionStrategy,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ChangeDetectorRef } from '@angular/core';
import { LocaltronService } from '../../../src/app/services/localtron.service';
import {
	ChatService,
	ChatThread,
	ChatMessage,
	Asset,
} from '../../../src/app/services/chat.service';
import {
	Prompt,
	PromptService,
} from '../../../src/app/services/prompt.service';
import { ModelService, Model } from '../../../src/app/services/model.service';
import { CharacterService, Character } from '../../../src/app/services/character.service';

import { ElectronAppService } from '../../../src/app/services/electron-app.service';
import { ConfigService } from '../../../src/app/services/config.service';
import { CharacterComponent } from '../character/character.component';
import { TranslatePipe } from '../../stdlib/translate.pipe';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from './message/message.component';
import { NgFor, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

const defaultThreadName = 'New chat';

@Component({
	selector: 'app-chat-box',
	templateUrl: './chat-box.component.html',
	styleUrl: './chat-box.component.css',
	encapsulation: ViewEncapsulation.None,
	standalone: true,
	imports: [
		IonicModule,
		NgFor,
		MessageComponent,
		NgIf,
		FormsModule,
		TranslatePipe,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatBoxComponent implements OnChanges {
	@ViewChild(CharacterComponent) characterModal!: CharacterComponent;
	@Input() promptTemplate: string = '[INST] {prompt} [/INST]';

	// @todo push this to the backend too
	@Input() threadNameSummaryTemplate =
		'Summarize, shorten this question in 3-5 words, keep it as a question: {message}';

	@Input() thread!: ChatThread;

	private model: Model | undefined;
	private models: Model[] = [];
	public promptQueue: Prompt[] = [];

	public message: string = '';
	public messages: ChatMessage[] = [];
	public assets: Asset[] = [];
	public messageCurrentlyStreamed: ChatMessage = {} as any;

	constructor(
		private localtron: LocaltronService,
		public lapi: ElectronAppService,
		private cd: ChangeDetectorRef,
		private configService: ConfigService,
		private promptService: PromptService,
		private chatService: ChatService,
		private modelService: ModelService,
		private characterService: CharacterService
	) {}

	private subscriptions: Subscription[] = [];

	async ngOnInit() {
		if (this.thread?.id) {
			let rsp = await this.chatService.chatMessages(this.thread.id);
			this.messages = rsp.messages;
			this.assets = rsp.assets;
		}

		this.models = await this.modelService.getModels();
		this.cd.markForCheck();

		this.subscriptions.push(
			this.configService.onConfigUpdate$.subscribe(async (config) => {
				this.model = this.models?.find(
					(m) => m.id == config?.model?.currentModelId
				);
			})
		);
		this.subscriptions.push(
			this.chatService.onChatMessageAdded$.subscribe(async (event) => {
				if (this.thread?.id && this.thread.id == event.threadId) {
					let rsp = await this.chatService.chatMessages(this.thread?.id);
					this.messages = rsp.messages;
					this.assets = rsp.assets;
					this.cd.markForCheck();
				}
			})
		);
	}

	getAssets(message: ChatMessage): Asset[] {
		return this.assets?.filter((a) => message.assetIds?.includes(a.id));
	}

	streamSubscription!: Subscription;
	promptSubscription!: Subscription;

	ngOnDestroy() {
		this.streamSubscription.unsubscribe();
		this.subscriptions.forEach((s) => {
			s.unsubscribe();
		});
	}

	async ngOnChanges(changes: SimpleChanges): Promise<void> {
		if (changes.thread) {
			this.messages = [];
			this.assets = [];
			this.cd.markForCheck();

			if (this.streamSubscription) {
				this.streamSubscription.unsubscribe();
			}
			if (this.promptSubscription) {
				this.promptSubscription.unsubscribe();
			}

			let threadId: string;

			if (!this.thread) {
				this.thread = {
					id: this.localtron.uuid(),
				};
				threadId = this.thread.id as string;
			} else {
				threadId = changes.thread.currentValue.id;
				let rsp = await this.chatService.chatMessages(threadId);
				this.messages = rsp.messages;
				this.assets = rsp.assets;
			}

			this.promptSubscription =
				this.promptService.onPromptListUpdate$.subscribe((promptList) => {
					let promptQueue = promptList?.filter((p) => {
						return p.threadId == threadId;
					});
					this.promptQueue = promptQueue;
					this.cd.markForCheck();
				});

			this.messageCurrentlyStreamed.content = '';
			let first = true;

			this.cd.markForCheck();

			// We are always subscribed to this, even if streaming is not happening
			// right now. There is always one streaming that is subscribed to
			// - the current thread on screen.
			this.streamSubscription = this.promptService
				.promptSubscribe(threadId)
				.subscribe(async (response) => {
					if (
						response?.choices &&
						response?.choices?.length > 0 &&
						response?.choices[0]?.text
					) {
						let insidePre =
							(this.messageCurrentlyStreamed.content.match(/```/g) || [])
								.length %
								2 ===
							1;
						let addVal = insidePre
							? response?.choices[0].text
							: escapeHtml(response?.choices[0].text);

						if (first) {
							addVal = addVal.trimStart();
							first = false;
						}

						this.messageCurrentlyStreamed = {
							...this.messageCurrentlyStreamed,
							content: this.messageCurrentlyStreamed.content + addVal,
						} as any;
					}

					if (
						response?.choices?.length > 0 &&
						response?.choices[0]?.finish_reason === 'stop'
					) {
						if (this.messages?.length == 1) {
							this.setThreadName(this.messages[0].content);
						}
						// @todo might not be needed now we have the `chatMessageAdded`
						// event coming from the firehose
						let rsp = await this.chatService.chatMessages(threadId);
						this.messages = rsp.messages;
						this.assets = rsp.assets;

						this.messageCurrentlyStreamed = {
							...this.messageCurrentlyStreamed,
							content: '',
						} as any;
					}
					this.cd.detectChanges();
				});
		}
	}

	async send() {
		if (!this.thread?.title) {
			this.thread.title = this.message.slice(0, 100);
		}

		let msg = this.message;
		this.message = '';

		this.sendMessage(msg);
	}

	async sendMessage(msg: string) {
		const character = this.getSelectedCharacter();
		await this.promptService.promptAdd({
			id: this.localtron.uuid(),
			prompt: msg,
			character: character?.data?.behaviour,
			template: this.promptTemplate,
			threadId: this.thread.id as string,
			modelId: this.model?.id as string,
		});
	}

	// Handle keydown event to differentiate between Enter and Shift+Enter
	handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (this.hasNonWhiteSpace(this.message)) {
				this.send();
			}
		} else if (event.key === 'Enter' && event.shiftKey) {
			event.preventDefault();
			this.message += '\n';
		}
	}

	public hasNonWhiteSpace(value: string): boolean {
		if (!value) {
			return false;
		}
		return /\S/.test(value);
	}

	setThreadName(msg: string) {
		if (!msg) {
			return;
		}
		if (this.thread?.title !== defaultThreadName) {
			return;
		}
		// @todo summarize with llm at the end of the streaming
	}

	public getSelectedCharacter(): Character {
		return this.characterService.selectedCharacter;
	}

	public showCharacterModal() {
		this.characterModal.show()
	}

	public getSelectedCharacterText(): string {
		const selectedCharacter = this.getSelectedCharacter();
		return selectedCharacter?.data?.name ? selectedCharacter.data.name : "None";
	trackById(_: number, message: { id?: string }): string {
		return message.id || '';
	}
}

function escapeHtml(unsafe: string) {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
