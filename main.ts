import { App, Editor, MarkdownView, Modal, normalizePath, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

const html = `
<figure style="text-align:center;">
    <img src="{path}" width="400" />
    <figcaption></figcaption>
</figure>
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

		// Prende la vista markdown attiva
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		// File attualmente aperto
		const file = view.file;
		if (!file) return;

		// Cartella padre
		const parentFolder = file.parent;
		const folderPath = parentFolder?.path;
		const attachmentsFolder = "Attachments";
		const normalizedFolderPath = normalizePath(`${folderPath}/${attachmentsFolder}`);

		// Nome file con timestamp per evitare conflitti
		const filename = `pasted-image-${Date.now()}.png`;
		const path = `${folderPath}/${attachmentsFolder}/${filename}`;
		console.log(path);
		
		// Crea la cartella Attachments nella cartella del file
		if (!(await this.app.vault.adapter.exists(normalizedFolderPath))) {
			await this.app.vault.createFolder(normalizedFolderPath);
		}

		// Salva il file nel vault
		const arrayBuffer = await blob.arrayBuffer();
		await this.app.vault.adapter.writeBinary(path, arrayBuffer);

		// Inserisci il wikilink personalizzato
		const formattedImageLink = html.replace(/\{([^}]*)\}/g, path);

		editor.replaceSelection(formattedImageLink);
	}
}
