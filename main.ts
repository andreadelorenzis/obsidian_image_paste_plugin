import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

const html = `
<div align="center">
	<img src="{path}" width="400" />
</div>
`

export default class CustomImagePaste extends Plugin {
	async onload() {
		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: any) => {
			const items: any = evt.clipboardData?.items;
				if (!items) return;

				for (const item of items) {
					console.log("item", item);
					if (item.type.startsWith('image/')) {
						evt.preventDefault(); // blocca la gestione predefinita
						this.handleImagePaste(item, editor);
					}
				}
			})
		);
	}

	async handleImagePaste(item: DataTransferItem, editor: CodeMirror.Editor) {
		const blob = item.getAsFile();
		if (!blob) return;

		// Nome file con timestamp per evitare conflitti
		const filename = `pasted-image-${Date.now()}.png`;

		const folder = "Attachments";
		if (!(await this.app.vault.adapter.exists(folder))) {
			await this.app.vault.createFolder(folder);
		}
		const path = `${folder}/${filename}`;

		// Salva il file nel vault
		const arrayBuffer = await blob.arrayBuffer();
		await this.app.vault.adapter.writeBinary(path, arrayBuffer);

		// Inserisci il wikilink personalizzato
		const formattedImageLink = html.replace(/\{([^}]*)\}/g, path);

		editor.replaceSelection(formattedImageLink);
	}
}
